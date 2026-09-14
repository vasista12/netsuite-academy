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

    # Admins and instructors can manage drafts.
    # Learners only see published courses.
    if current_user.role.value == "user":
        query = query.filter(Course.is_published == True)

    return query.all()
# ============================================================
# GET COURSE
# ============================================================

@router.get(
    "/{course_id}",
    response_model=CourseOut,
)
def get_course(
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

    return course

    # ============================================================
# GET COURSE MODULES
# ============================================================

@router.get(
    "/{course_id}/modules",
)
def get_course_modules(
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

    from app.models import Module

    modules = (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.sort_order, Module.id)
        .all()
    )

    return [
        {
            "id": module.id,
            "course_id": module.course_id,
            "title": module.title,
            "content": module.content,
            "video_url": module.video_url,
            "module_type": module.module_type,
            "sort_order": module.sort_order,
        }
        for module in modules
    ]


# ============================================================
# CREATE COURSE MODULE
# ============================================================

@router.post(
    "/{course_id}/modules",
)
def create_course_module(
    course_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
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

    module = Module(
        course_id=course_id,
        title=data.get("title"),
        content=data.get("content"),
        video_url=data.get("video_url"),
        module_type=data.get("module_type", "text"),
        sort_order=data.get("sort_order", 0),
    )

    db.add(module)
    db.commit()
    db.refresh(module)

    return {
        "id": module.id,
        "course_id": module.course_id,
        "title": module.title,
        "content": module.content,
        "video_url": module.video_url,
        "module_type": module.module_type,
        "sort_order": module.sort_order,
    }


# ============================================================
# UPDATE COURSE
# ============================================================

@router.put(
    "/{course_id}",
    response_model=CourseOut,
)
def update_course(
    course_id: int,
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
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

    course.title = data.title
    course.description = data.description
    course.category = data.category
    course.passing_score = data.passing_score

    db.commit()
    db.refresh(course)

    return course


# ============================================================
# PUBLISH COURSE
# ============================================================

@router.patch(
    "/{course_id}/publish",
    response_model=CourseOut,
)
def publish_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
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

    course.is_published = True

    db.commit()
    db.refresh(course)

    return course


# ============================================================
# DELETE COURSE
# ============================================================

@router.delete(
    "/{course_id}",
)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
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

    db.delete(course)
    db.commit()

    return {
        "message": "Course deleted successfully"
    }