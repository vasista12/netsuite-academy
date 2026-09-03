from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, UserRole, Course, Certificate
from app.auth import require_admin
from app.schemas import DashboardStats, UserOut

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ============================================================
# DASHBOARD
# ============================================================

@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    total_courses = db.query(Course).count()

    active_learners = (
        db.query(User)
        .filter(User.role == UserRole.USER)
        .count()
    )

    certificates_issued = db.query(Certificate).count()

    average_pass_rate = (
        db.query(func.avg(Certificate.final_score))
        .scalar()
    )

    if average_pass_rate is None:
        average_pass_rate = 0

    return {
        "total_courses": total_courses,
        "active_learners": active_learners,
        "avg_pass_rate": round(float(average_pass_rate), 2),
        "certificates_issued": certificates_issued,
    }


# ============================================================
# USERS
# ============================================================

@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(User).all()