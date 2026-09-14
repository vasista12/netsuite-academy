from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Course, UserProgress, Certificate
from app.auth import require_admin


router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)


@router.get("/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    total_courses = db.query(Course).count()

    active_learners = (
        db.query(User)
        .filter(User.role == "user")
        .count()
    )

    certificates_issued = db.query(Certificate).count()

    total_attempts = (
        db.query(UserProgress)
        .filter(UserProgress.attempts > 0)
        .count()
    )

    completed = (
        db.query(UserProgress)
        .filter(UserProgress.status == "completed")
        .count()
    )

    avg_pass_rate = (
        (completed / total_attempts) * 100
        if total_attempts > 0
        else 0
    )

    return {
        "total_courses": total_courses,
        "active_learners": active_learners,
        "avg_pass_rate": round(avg_pass_rate, 1),
        "certificates_issued": certificates_issued
    }


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
        for user in users
    ]