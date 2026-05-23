"""Analytics models for emotion and voice session tracking."""

import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import Base
from sqlalchemy.orm import relationship


class EmotionSession(Base):
    """Tracks facial emotion analysis during an interview or practice session."""

    __tablename__ = "emotion_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    interview_id = Column(
        UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="SET NULL"), nullable=True
    )
    dominant_emotion = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)
    frame_count = Column(Integer, default=0)
    emotion_timeline = Column(JSONB, nullable=True)
    summary = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="emotion_sessions")


class VoiceSession(Base):
    """Tracks voice analysis metrics (pitch, pace, fillers) for a session."""

    __tablename__ = "voice_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    interview_id = Column(
        UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="SET NULL"), nullable=True
    )
    audio_url = Column(String(512), nullable=True)
    duration_seconds = Column(Float, nullable=True)
    words_per_minute = Column(Float, nullable=True)
    filler_word_count = Column(Integer, default=0)
    confidence_score = Column(Float, nullable=True)
    pitch_stats = Column(JSONB, nullable=True)
    analysis = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="voice_sessions")
