from pydantic import BaseModel
from typing import List, Optional


# =========================
# AUTH
# =========================

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "user"


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True


# =========================
# QUIZ
# =========================

class Option(BaseModel):
    id: int
    text: str


class QuizCreate(BaseModel):
    question: str
    options: List[Option]
    correct_option_id: int
    passing_score: int = 70


class QuizOut(BaseModel):
    id: int
    question: str
    options: List[Option]
    passing_score: int

    class Config:
        from_attributes = True


# =========================
# MODULE
# =========================

class ModuleCreate(BaseModel):
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    module_type: str = "text"
    sort_order: int = 0
    quiz: Optional[QuizCreate] = None


class ModuleOut(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    module_type: str
    sort_order: int
    quiz: Optional[QuizOut] = None
    status: Optional[str] = None
    score: Optional[int] = None

    class Config:
        from_attributes = True


# =========================
# COURSE
# =========================

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    passing_score: int = 70


class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    passing_score: int
    created_by: int
    is_published: bool

    class Config:
        from_attributes = True

# =========================
# QUIZ SUBMISSION
# =========================
class QuizSubmit(BaseModel):
    answers: dict[int, str]


class QuizResult(BaseModel):
    quiz_id: int
    total_questions: int
    correct_answers: int
    score: int
    passing_score: int
    passed: bool

# =========================
# PROGRESS
# =========================

class ProgressOut(BaseModel):
    module_id: int
    status: str
    score: Optional[int] = None
    attempts: int

    class Config:
        from_attributes = True


# =========================
# CERTIFICATE
# =========================

class CertificateOut(BaseModel):
    id: int
    certificate_number: str
    final_score: int
    issued_at: object
    course_title: str
    user_name: str

    class Config:
        from_attributes = True


# =========================
# ADMIN DASHBOARD
# =========================

class DashboardStats(BaseModel):
    total_courses: int
    active_learners: int
    avg_pass_rate: float
    certificates_issued: int