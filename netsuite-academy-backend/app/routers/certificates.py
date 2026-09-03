from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from datetime import datetime
import uuid

from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm

from app.database import get_db
from app.models import User, Course, Certificate, UserProgress
from app.auth import get_current_user


router = APIRouter(
    prefix="/certificates",
    tags=["Certificates"],
)


# ============================================================
# GET MY CERTIFICATES
# ============================================================

@router.get("")
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    certificates = (
        db.query(Certificate)
        .filter(Certificate.user_id == current_user.id)
        .all()
    )

    results = []

    for certificate in certificates:

        course = (
            db.query(Course)
            .filter(Course.id == certificate.course_id)
            .first()
        )

        results.append({
            "id": certificate.id,
            "certificate_number": certificate.certificate_number,
            "final_score": certificate.final_score,
            "issued_at": certificate.issued_at,
            "course_title": (
                course.title
                if course
                else "Unknown Course"
            ),
            "user_name": current_user.full_name,
        })

    return results


# ============================================================
# GENERATE CERTIFICATE
# ============================================================

@router.post("/{course_id}/generate")
def generate_certificate(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # --------------------------------------------------------
    # Get course
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Check if certificate already exists
    # --------------------------------------------------------

    existing_certificate = (
        db.query(Certificate)
        .filter(
            Certificate.user_id == current_user.id,
            Certificate.course_id == course_id,
        )
        .first()
    )

    if existing_certificate:
        return {
            "message": "Certificate already exists",
            "certificate_id": existing_certificate.id,
            "certificate_number": existing_certificate.certificate_number,
            "final_score": existing_certificate.final_score,
            "download_url": (
                f"/certificates/"
                f"{existing_certificate.id}/download"
            ),
        }

    # --------------------------------------------------------
    # Get learner progress
    # --------------------------------------------------------

    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.course_id == course_id,
        )
        .all()
    )

    # --------------------------------------------------------
    # Calculate final score
    # --------------------------------------------------------

    scores = [
        p.score
        for p in progress
        if p.score is not None
    ]

    if scores:
        final_score = round(sum(scores) / len(scores))
    else:
        final_score = 100

    # --------------------------------------------------------
    # Passing score check
    # --------------------------------------------------------

    if final_score < course.passing_score:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Course not completed. "
                f"Required score: {course.passing_score}%. "
                f"Your score: {final_score}%."
            ),
        )

    # --------------------------------------------------------
    # Generate certificate number
    # --------------------------------------------------------

    certificate_number = (
        "NSA-"
        + datetime.now().strftime("%Y%m%d")
        + "-"
        + uuid.uuid4().hex[:8].upper()
    )

    # --------------------------------------------------------
    # Save certificate
    # --------------------------------------------------------

    certificate = Certificate(
        user_id=current_user.id,
        course_id=course_id,
        certificate_number=certificate_number,
        final_score=final_score,
    )

    db.add(certificate)
    db.commit()
    db.refresh(certificate)

    return {
        "message": "Certificate generated successfully",
        "certificate_id": certificate.id,
        "certificate_number": certificate.certificate_number,
        "final_score": final_score,
        "download_url": (
            f"/certificates/"
            f"{certificate.id}/download"
        ),
    }


# ============================================================
# DOWNLOAD CERTIFICATE PDF
# ============================================================

@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    certificate = (
        db.query(Certificate)
        .filter(Certificate.id == certificate_id)
        .first()
    )

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found",
        )

    # --------------------------------------------------------
    # Check ownership / admin
    # --------------------------------------------------------

    role = (
        current_user.role.value
        if hasattr(current_user.role, "value")
        else str(current_user.role)
    )

    if (
        certificate.user_id != current_user.id
        and role != "admin"
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    # --------------------------------------------------------
    # Get user
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == certificate.user_id)
        .first()
    )

    # --------------------------------------------------------
    # Get course
    # --------------------------------------------------------

    course = (
        db.query(Course)
        .filter(Course.id == certificate.course_id)
        .first()
    )

    if not user or not course:
        raise HTTPException(
            status_code=404,
            detail="Certificate data not found",
        )

    # --------------------------------------------------------
    # Create PDF
    # --------------------------------------------------------

    buffer = BytesIO()

    pdf = canvas.Canvas(
        buffer,
        pagesize=landscape(A4),
    )

    width, height = landscape(A4)

    # Outer border
    pdf.setLineWidth(4)

    pdf.rect(
        15 * mm,
        15 * mm,
        width - 30 * mm,
        height - 30 * mm,
    )

    # Inner border
    pdf.setLineWidth(1)

    pdf.rect(
        20 * mm,
        20 * mm,
        width - 40 * mm,
        height - 40 * mm,
    )

    # --------------------------------------------------------
    # Title
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        30,
    )

    pdf.drawCentredString(
        width / 2,
        height - 55 * mm,
        "CERTIFICATE OF COMPLETION",
    )

    # --------------------------------------------------------
    # Academy
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        18,
    )

    pdf.drawCentredString(
        width / 2,
        height - 70 * mm,
        "NetSuite Academy",
    )

    # --------------------------------------------------------
    # Presented to
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica",
        14,
    )

    pdf.drawCentredString(
        width / 2,
        height - 90 * mm,
        "This certificate is proudly presented to",
    )

    # --------------------------------------------------------
    # Student
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        26,
    )

    pdf.drawCentredString(
        width / 2,
        height - 108 * mm,
        user.full_name,
    )

    # --------------------------------------------------------
    # Completion text
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica",
        14,
    )

    pdf.drawCentredString(
        width / 2,
        height - 127 * mm,
        "for successfully completing",
    )

    # --------------------------------------------------------
    # Course
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        21,
    )

    pdf.drawCentredString(
        width / 2,
        height - 143 * mm,
        course.title,
    )

    # --------------------------------------------------------
    # Score
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        14,
    )

    pdf.drawCentredString(
        width / 2,
        height - 160 * mm,
        f"Final Score: {certificate.final_score}%",
    )

    # --------------------------------------------------------
    # Certificate number
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica",
        9,
    )

    pdf.drawString(
        30 * mm,
        25 * mm,
        f"Certificate No: {certificate.certificate_number}",
    )

    # --------------------------------------------------------
    # Date
    # --------------------------------------------------------

    pdf.drawRightString(
        width - 30 * mm,
        25 * mm,
        f"Issued: {certificate.issued_at.strftime('%d %B %Y')}",
    )

    # Finish PDF
    pdf.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                f'filename="certificate_'
                f'{certificate.certificate_number}.pdf"'
            )
        },
    )