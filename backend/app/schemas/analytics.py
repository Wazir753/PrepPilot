"""Pydantic schemas for analytics and dashboard endpoints."""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any
from uuid import UUID
from datetime import datetime


class EmotionSessionCreate(BaseModel):
    """Start or record an emotion analysis session."""

    interview_id: Optional[UUID] = None
    frame_data: Optional[list[dict[str, Any]]] = None


class EmotionSessionOut(BaseModel):
    """Emotion session result."""

    id: UUID
    user_id: UUID
    interview_id: Optional[UUID] = None
    dominant_emotion: Optional[str] = None
    confidence_score: Optional[float] = None
    frame_count: int
    emotion_timeline: Optional[list[dict[str, Any]]] = None
    summary: Optional[dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VoiceSessionCreate(BaseModel):
    """Submit audio for voice analysis."""

    interview_id: Optional[UUID] = None
    audio_url: Optional[str] = None
    transcript: Optional[str] = None


class VoiceSessionOut(BaseModel):
    """Voice analysis session result."""

    id: UUID
    user_id: UUID
    interview_id: Optional[UUID] = None
    audio_url: Optional[str] = None
    duration_seconds: Optional[float] = None
    words_per_minute: Optional[float] = None
    filler_word_count: int
    confidence_score: Optional[float] = None
    pitch_stats: Optional[dict[str, Any]] = None
    analysis: Optional[dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserAnalyticsSummary(BaseModel):
    """Aggregated analytics for a user dashboard."""

    total_interviews: int
    completed_interviews: int
    average_score: Optional[float] = None
    average_technical_score: Optional[float] = None
    average_communication_score: Optional[float] = None
    recent_scores: list[float] = Field(default_factory=list)
    emotion_summary: Optional[dict[str, Any]] = None
    voice_summary: Optional[dict[str, Any]] = None


class RoadmapRequest(BaseModel):
    """Request personalized learning roadmap."""

    target_role: str
    current_skills: Optional[list[str]] = None
    weak_areas: Optional[list[str]] = None


class HiringRecommendationRequest(BaseModel):
    """Request hiring recommendation based on interview history."""

    interview_ids: list[UUID]
    role: str
