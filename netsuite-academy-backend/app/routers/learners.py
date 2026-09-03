from app.models import User, UserRole
from app.auth import require_admin

@router.get("/learners")
def get_learners(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    users = (
        db.query(User)
        .filter(User.role == UserRole.USER)
        .order_by(User.id)
        .all()
    )

    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
        }
        for user in users
    ]