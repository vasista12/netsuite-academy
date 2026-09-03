from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.database import get_db
from app.models import (
    Course,
    Module,
    Quiz,
    QuizQuestion,
    UserProgress,
    Certificate,
    ProgressStatus,
)
from app.auth import get_current_user, require_instructor_or_admin


router = APIRouter(
    prefix="/quizzes",
    tags=["Quizzes"],
)


# ============================================================
# SCHEMAS
# ============================================================

class QuizCreate(BaseModel):
    course_id: int
    title: str
    passing_score: int = 70


class QuestionCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str


class QuizOut(BaseModel):
    id: int
    course_id: int
    title: str
    passing_score: int

    class Config:
        from_attributes = True


class QuestionOut(BaseModel):
    id: int
    quiz_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    answers: dict[int, str]


class QuizResult(BaseModel):
    quiz_id: int
    total_questions: int
    correct_answers: int
    score: int
    passing_score: int
    passed: bool


# ============================================================
# CREATE QUIZ
# ============================================================

@router.post(
    "",
    response_model=QuizOut,
    status_code=201,
)
def create_quiz(
    data: QuizCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
):
    course = (
        db.query(Course)
        .filter(Course.id == data.course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    quiz = Quiz(
        course_id=data.course_id,
        title=data.title,
        passing_score=data.passing_score,
    )

    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return quiz


# ============================================================
# LIST QUIZZES FOR COURSE
# ============================================================

@router.get(
    "/course/{course_id}",
    response_model=list[QuizOut],
)
def get_course_quizzes(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id)
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    return (
        db.query(Quiz)
        .filter(Quiz.course_id == course_id)
        .order_by(Quiz.id.desc())
        .all()
    )


# ============================================================
# DELETE QUIZ
# ============================================================

@router.delete(
    "/{quiz_id}",
)
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
):
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found",
        )

    db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).delete(
        synchronize_session=False
    )

    db.delete(quiz)
    db.commit()

    return {
        "message": "Quiz deleted successfully"
    }


# ============================================================
# ADD QUESTION
# ============================================================

@router.post(
    "/{quiz_id}/questions",
    response_model=QuestionOut,
    status_code=201,
)
def add_question(
    quiz_id: int,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
):
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found",
        )

    correct_answer = data.correct_answer.upper()

    if correct_answer not in ["A", "B", "C", "D"]:
        raise HTTPException(
            status_code=400,
            detail="correct_answer must be A, B, C, or D",
        )

    question = QuizQuestion(
        quiz_id=quiz_id,
        question=data.question,
        option_a=data.option_a,
        option_b=data.option_b,
        option_c=data.option_c,
        option_d=data.option_d,
        correct_answer=correct_answer,
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question


# ============================================================
# UPDATE QUESTION
# ============================================================

@router.put(
    "/{quiz_id}/questions/{question_id}",
    response_model=QuestionOut,
)
def update_question(
    quiz_id: int,
    question_id: int,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
):
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found",
        )

    question = (
        db.query(QuizQuestion)
        .filter(
            QuizQuestion.id == question_id,
            QuizQuestion.quiz_id == quiz_id,
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    correct_answer = data.correct_answer.upper()

    if correct_answer not in ["A", "B", "C", "D"]:
        raise HTTPException(
            status_code=400,
            detail="correct_answer must be A, B, C, or D",
        )

    question.question = data.question
    question.option_a = data.option_a
    question.option_b = data.option_b
    question.option_c = data.option_c
    question.option_d = data.option_d
    question.correct_answer = correct_answer

    db.commit()
    db.refresh(question)

    return question


# ============================================================
# DELETE QUESTION
# ============================================================

@router.delete(
    "/{quiz_id}/questions/{question_id}",
)
def delete_question(
    quiz_id: int,
    question_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
):
    question = (
        db.query(QuizQuestion)
        .filter(
            QuizQuestion.id == question_id,
            QuizQuestion.quiz_id == quiz_id,
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    db.delete(question)
    db.commit()

    return {
        "message": "Question deleted successfully"
    }


# ============================================================
# GET QUIZ
# ============================================================

@router.get(
    "/{quiz_id}",
)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found",
        )

    questions = (
        db.query(QuizQuestion)
        .filter(QuizQuestion.quiz_id == quiz_id)
        .order_by(QuizQuestion.id)
        .all()
    )

    return {
        "id": quiz.id,
        "course_id": quiz.course_id,
        "title": quiz.title,
        "passing_score": quiz.passing_score,
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
            }
            for q in questions
        ],
    }


# ============================================================
# SUBMIT QUIZ
# ============================================================

@router.post(
    "/{quiz_id}/submit",
    response_model=QuizResult,
)
def submit_quiz(
    quiz_id: int,
    data: QuizSubmit,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found",
        )

    questions = (
        db.query(QuizQuestion)
        .filter(QuizQuestion.quiz_id == quiz_id)
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="Quiz has no questions",
        )

    # --------------------------------------------------------
    # CALCULATE SCORE
    # --------------------------------------------------------

    correct_answers = 0

    for question in questions:
        submitted_answer = data.answers.get(question.id)

        if (
            submitted_answer
            and submitted_answer.upper()
            == question.correct_answer.upper()
        ):
            correct_answers += 1

    total_questions = len(questions)

    score = round(
        (correct_answers / total_questions) * 100
    )

    passed = score >= quiz.passing_score

    # --------------------------------------------------------
    # FIND MODULE ASSOCIATED WITH THIS QUIZ
    #
    # Current database design stores quiz.course_id rather
    # than module_id, so we associate the quiz with the first
    # course module when there is only one module.
    # --------------------------------------------------------

    modules = (
        db.query(Module)
        .filter(Module.course_id == quiz.course_id)
        .order_by(Module.sort_order)
        .all()
    )

    module = None

    if len(modules) == 1:
        module = modules[0]

    # --------------------------------------------------------
    # SAVE PROGRESS
    # --------------------------------------------------------

    if module:
        progress = (
            db.query(UserProgress)
            .filter(
                UserProgress.user_id == current_user.id,
                UserProgress.module_id == module.id,
            )
            .first()
        )

        if not progress:
            progress = UserProgress(
                user_id=current_user.id,
                module_id=module.id,
                course_id=quiz.course_id,
                status=(
                    ProgressStatus.COMPLETED
                    if passed
                    else ProgressStatus.IN_PROGRESS
                ),
                score=score,
                attempts=1,
            )

            db.add(progress)

        else:
            progress.attempts = (progress.attempts or 0) + 1
            progress.score = score

            if passed:
                progress.status = ProgressStatus.COMPLETED
            else:
                progress.status = ProgressStatus.IN_PROGRESS

    # --------------------------------------------------------
    # CHECK COURSE COMPLETION
    # --------------------------------------------------------

    course_completed = False
    certificate = None

    if passed and modules:
        module_ids = [module.id for module in modules]

        completed_count = (
            db.query(UserProgress)
            .filter(
                UserProgress.user_id == current_user.id,
                UserProgress.course_id == quiz.course_id,
                UserProgress.module_id.in_(module_ids),
                UserProgress.status == ProgressStatus.COMPLETED,
            )
            .count()
        )

        # Include the current module if the new progress object
        # hasn't been flushed into the database yet.
        if module and completed_count < len(modules):
            current_progress = (
                db.query(UserProgress)
                .filter(
                    UserProgress.user_id == current_user.id,
                    UserProgress.module_id == module.id,
                    UserProgress.status == ProgressStatus.COMPLETED,
                )
                .first()
            )

            if current_progress:
                completed_count += 1

        if completed_count >= len(modules):
            course_completed = True

            # ------------------------------------------------
            # CREATE CERTIFICATE ONLY ONCE
            # ------------------------------------------------

            certificate = (
                db.query(Certificate)
                .filter(
                    Certificate.user_id == current_user.id,
                    Certificate.course_id == quiz.course_id,
                )
                .first()
            )

            if not certificate:
                certificate = Certificate(
                    user_id=current_user.id,
                    course_id=quiz.course_id,
                    certificate_number=f"NSA-{uuid.uuid4().hex[:10].upper()}",
                    final_score=score,
                    issued_at=datetime.utcnow(),
                )

                db.add(certificate)

    db.commit()

    return {
        "quiz_id": quiz.id,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "score": score,
        "passing_score": quiz.passing_score,
        "passed": passed,
    }