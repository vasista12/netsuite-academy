from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Course, Module
from app.schemas import CourseCreate, CourseOut
from app.auth import (
    get_current_user,
    require_admin,
    require_instructor_or_admin,
)

router = APIRouter(
    prefix="/courses",
    tags=["Courses"],
)


# ============================================================
# LIST COURSES
# ============================================================

@router.get(
    "",
    response_model=list[CourseOut],
)
def get_courses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Course)

    # Learners only see published courses
    if current_user.role.value == "user":
        query = query.filter(Course.is_published == True)

    return query.all()


# ============================================================
# CREATE COURSE
# ============================================================

@router.post(
    "",
    response_model=CourseOut,
)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
):
    course = Course(
        title=data.title,
        description=data.description,
        category=data.category,
        passing_score=data.passing_score,
        created_by=current_user.id,
        is_published=False,
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    return course