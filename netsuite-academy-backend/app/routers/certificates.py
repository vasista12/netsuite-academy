from datetime import datetime
from io import BytesIO
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Certificate, Course, Quiz, QuizQuestion, User

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.post("/quiz/{quiz_id}")
def issue_certificate(
    quiz_id: int,
    score: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if score < quiz.passing_score:
        raise HTTPException(
            status_code=400,
            detail="Certificate is available only after passing the quiz"
        )

    existing = (
        db.query(Certificate)
        .filter(
            Certificate.user_id == current_user.id,
            Certificate.course_id == quiz.course_id
        )
        .first()
    )

    if existing:
        existing.final_score = score
        db.commit()
        db.refresh(existing)
        certificate = existing
    else:
        certificate = Certificate(
            user_id=current_user.id,
            course_id=quiz.course_id,
            certificate_number=f"NSA-{datetime.utcnow():%Y%m%d}-{uuid4().hex[:8].upper()}",
            final_score=score,
        )

        db.add(certificate)
        db.commit()
        db.refresh(certificate)

    course = db.query(Course).filter(
        Course.id == certificate.course_id
    ).first()

    return {
        "id": certificate.id,
        "certificate_number": certificate.certificate_number,
        "final_score": certificate.final_score,
        "issued_at": certificate.issued_at,
        "course_title": course.title if course else "NetSuite Academy Course",
        "user_name": current_user.full_name,
    }


@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    certificate = db.query(Certificate).filter(
        Certificate.id == certificate_id
    ).first()

    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if certificate.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot access this certificate"
        )

    course = db.query(Course).filter(
        Course.id == certificate.course_id
    ).first()

    course_title = (
        course.title
        if course
        else "NetSuite Academy Course"
    )

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=55,
        leftMargin=55,
        topMargin=45,
        bottomMargin=45,
    )

    styles = getSampleStyleSheet()

    title = ParagraphStyle(
        "CertificateTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=32,
        leading=38,
        textColor=colors.HexColor("#17324D"),
    )

    subtitle = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=14,
        leading=20,
        textColor=colors.HexColor("#5F6B78"),
    )

    name = ParagraphStyle(
        "Name",
        parent=styles["Heading1"],
        alignment=TA_CENTER,
        fontSize=27,
        leading=34,
        textColor=colors.HexColor("#1F4E79"),
    )

    course_style = ParagraphStyle(
        "Course",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=18,
        leading=24,
        textColor=colors.HexColor("#17202A"),
    )

    story = [
        Spacer(1, 25),
        Paragraph("NETSUITE ACADEMY", title),
        Paragraph("CERTIFICATE OF COMPLETION", subtitle),
        Spacer(1, 18),
        Paragraph("This certificate is proudly presented to", subtitle),
        Paragraph(current_user.full_name, name),
        Paragraph("for successfully completing", subtitle),
        Paragraph(course_title, course_style),
        Spacer(1, 15),
    ]

    details = Table(
        [[
            f"Final Score: {certificate.final_score}%",
            f"Certificate No.: {certificate.certificate_number}",
            f"Issued: {certificate.issued_at:%d %b %Y}"
        ]],
        colWidths=[190, 250, 190],
    )

    details.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#5F6B78")),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#D8E1EA")),
    ]))

    story.append(details)
    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "NetSuite Academy • Professional Learning & Development",
            subtitle
        )
    )

    def draw_background(canvas, doc):
        canvas.saveState()

        width, height = landscape(A4)

        canvas.setStrokeColor(colors.HexColor("#1F4E79"))
        canvas.setLineWidth(2.5)
        canvas.rect(25, 25, width - 50, height - 50)

        canvas.setLineWidth(0.8)
        canvas.setStrokeColor(colors.HexColor("#B9C9D8"))
        canvas.rect(34, 34, width - 68, height - 68)

        canvas.restoreState()

    doc.build(
        story,
        onFirstPage=draw_background
    )

    buffer.seek(0)

    filename = f"{certificate.certificate_number}.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }
    )