"""Coding submission model for sandbox execution results."""

import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from app.models.base import Base
from sqlalchemy.orm import relationship


class CodingSubmission(Base):
    """Stores a user's code submission and evaluation for a coding challenge."""

    __tablename__ = "coding_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    interview_id = Column(
        UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="SET NULL"), nullable=True
    )
    problem_title = Column(String(255), nullable=False)
    language = Column(String(50), nullable=False)
    source_code = Column(Text, nullable=False)
    stdin = Column(Text, nullable=True)
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    exit_code = Column(Integer, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    status = Column(
        ENUM("pending", "running", "success", "error", "timeout", name="submission_statuses"),
        default="pending",
    )
    test_results = Column(JSONB, nullable=True)
    ai_evaluation = Column(JSONB, nullable=True)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="coding_submissions")
