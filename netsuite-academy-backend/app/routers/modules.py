from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Course, Module
from app.auth import get_current_user, require_instructor_or_admin


router = APIRouter(
    prefix="/modules",
    tags=["Modules"],
)


class ModuleCreate(BaseModel):
    course_id: int
    title: str
    content: str
    video_url: str | None = None
    module_type: str = "text"
    sort_order: int = 0


class ModuleOut(BaseModel):
    id: int
    course_id: int
    title: str
    content: str
    video_url: str | None
    module_type: str
    sort_order: int

    class Config:
        from_attributes = True


@router.post(
    "",
    response_model=ModuleOut,
    status_code=201,
)
def create_module(
    data: ModuleCreate,
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

    module = Module(
        course_id=data.course_id,
        title=data.title,
        content=data.content,
        video_url=data.video_url,
        module_type=data.module_type,
        sort_order=data.sort_order,
    )

    db.add(module)
    db.commit()
    db.refresh(module)

    return module


@router.get(
    "/course/{course_id}",
    response_model=list[ModuleOut],
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

    return (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.sort_order)
        .all()
    )


@router.get(
    "/{module_id}",
    response_model=ModuleOut,
)
def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    module = (
        db.query(Module)
        .filter(Module.id == module_id)
        .first()
    )

    if not module:
        raise HTTPException(
            status_code=404,
            detail="Module not found",
        )

    return module


@router.delete(
    "/{module_id}",
)
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_instructor_or_admin),
):
    module = (
        db.query(Module)
        .filter(Module.id == module_id)
        .first()
    )

    if not module:
        raise HTTPException(
            status_code=404,
            detail="Module not found",
        )

    db.delete(module)
    db.commit()

    return {
        "message": "Module deleted successfully"
    }