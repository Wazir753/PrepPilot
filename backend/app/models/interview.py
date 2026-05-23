import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ENUM
from app.models.base import Base
from sqlalchemy.orm import relationship

class Interview(Base):
    """Interview model representing an interview session."""
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(100), nullable=False)
    difficulty = Column(ENUM('easy', 'medium', 'hard', name='interview_difficulties'), nullable=False)
    interview_type = Column(ENUM('technical', 'hr', 'behavioral', 'coding', name='interview_types'), nullable=False)
    status = Column(ENUM('in_progress', 'completed', 'abandoned', name='interview_statuses'), default='in_progress')
    
    final_score = Column(Float, nullable=True)
    technical_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    confidence_level = Column(String(20), nullable=True)
    
    duration_seconds = Column(Integer, nullable=True)
    question_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", backref="interviews")
    responses = relationship("Response", backref="interview", cascade="all, delete-orphan")
