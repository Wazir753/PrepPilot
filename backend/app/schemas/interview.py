"""Pydantic schemas for interview endpoints."""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime


DifficultyLevel = Literal["easy", "medium", "hard"]
InterviewType = Literal["technical", "hr", "behavioral", "coding"]
InterviewStatus = Literal["in_progress", "completed", "abandoned"]


class InterviewCreate(BaseModel):
    """Request body to start a new interview."""

    role: str = Field(..., min_length=1, max_length=100)
    difficulty: DifficultyLevel = "medium"
    interview_type: InterviewType = "technical"


class InterviewUpdate(BaseModel):
    """Optional fields when updating an interview."""

    status: Optional[InterviewStatus] = None
    final_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    confidence_level: Optional[str] = None
    duration_seconds: Optional[int] = None


class InterviewResponse(BaseModel):
    """Interview resource returned to clients."""

    id: UUID
    user_id: UUID
    role: str
    difficulty: str
    interview_type: str
    status: str
    final_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    confidence_level: Optional[str] = None
    duration_seconds: Optional[int] = None
    question_count: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class NextQuestionRequest(BaseModel):
    """Request next adaptive question for an interview."""

    previous_score: Optional[float] = Field(None, ge=0, le=100)


class QuestionPayload(BaseModel):
    """Generated interview question."""

    question_number: int
    question_text: str
    difficulty: str
    category: Optional[str] = None


class InterviewCompleteRequest(BaseModel):
    """Finalize interview with optional duration."""

    duration_seconds: Optional[int] = None


class LeaderboardEntry(BaseModel):
    """Single leaderboard row."""

    user_id: UUID
    name: str
    average_score: float
    interview_count: int
    rank: int
