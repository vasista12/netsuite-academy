from datetime import datetime
import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Text,
    Boolean,
    Enum as SQLEnum,
)

from app.database import Base


# ============================================================
# ENUMS
# ============================================================

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    USER = "user"


class ProgressStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# ============================================================
# USER
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    full_name = Column(
        String(255),
        nullable=False
    )

    role = Column(
        SQLEnum(UserRole),
        default=UserRole.USER,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# COURSE
# ============================================================

class Course(Base):
    __tablename__ = "courses"

    id = Column(
        Integer,
        primary_key=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text
    )

    category = Column(
        String(100)
    )

    passing_score = Column(
        Integer,
        default=70
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    is_published = Column(
        Boolean,
        default=False
    )


# ============================================================
# MODULE
# ============================================================

class Module(Base):
    __tablename__ = "modules"

    id = Column(
        Integer,
        primary_key=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    title = Column(
        String(255),
        nullable=False
    )

    content = Column(
        Text
    )

    video_url = Column(
        String(500)
    )

    module_type = Column(
        String(20),
        default="text"
    )

    sort_order = Column(
        Integer,
        default=0
    )


# ============================================================
# QUIZ
# ============================================================

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(
        Integer,
        primary_key=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    title = Column(
        String(255),
        nullable=False
    )

    passing_score = Column(
        Integer,
        default=70
    )


# ============================================================
# QUIZ QUESTION
# ============================================================

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(
        Integer,
        primary_key=True
    )

    quiz_id = Column(
        Integer,
        ForeignKey("quizzes.id")
    )

    question = Column(
        Text,
        nullable=False
    )

    option_a = Column(
        String(500)
    )

    option_b = Column(
        String(500)
    )

    option_c = Column(
        String(500)
    )

    option_d = Column(
        String(500)
    )

    correct_answer = Column(
        String(1)
    )


# ============================================================
# USER PROGRESS
# ============================================================

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    module_id = Column(
        Integer,
        ForeignKey("modules.id")
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    status = Column(
        SQLEnum(ProgressStatus),
        default=ProgressStatus.NOT_STARTED
    )

    score = Column(
        Integer
    )

    attempts = Column(
        Integer,
        default=0
    )


# ============================================================
# CERTIFICATE
# ============================================================

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id")
    )

    certificate_number = Column(
        String(50),
        unique=True,
        nullable=False
    )

    final_score = Column(
        Integer
    )

    issued_at = Column(
        DateTime,
        default=datetime.utcnow
    )