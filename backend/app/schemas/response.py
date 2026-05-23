"""Pydantic schemas for interview response (answer) endpoints."""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any
from uuid import UUID
from datetime import datetime


class ResponseCreate(BaseModel):
    """Submit an answer to an interview question."""

    question_number: int = Field(..., ge=1)
    question_text: str
    answer_text: Optional[str] = None
    audio_url: Optional[str] = None
    response_time_seconds: Optional[int] = None


class ResponseUpdate(BaseModel):
    """Update response with evaluation results."""

    score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    ai_feedback: Optional[dict[str, Any]] = None


class ResponseOut(BaseModel):
    """Interview answer resource."""

    id: UUID
    interview_id: UUID
    question_number: int
    question_text: str
    answer_text: Optional[str] = None
    audio_url: Optional[str] = None
    ai_feedback: Optional[dict[str, Any]] = None
    score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    response_time_seconds: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvaluateAnswerRequest(BaseModel):
    """Trigger AI evaluation for a submitted answer."""

    answer_text: str
    question_text: str
    role: str
    difficulty: str = "medium"
