"""Pydantic schemas for coding challenge endpoints."""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any, Literal
from uuid import UUID
from datetime import datetime


SupportedLanguage = Literal["python", "javascript", "java", "cpp"]


class CodeExecuteRequest(BaseModel):
    """Execute code in the sandbox."""

    source_code: str = Field(..., min_length=1)
    language: SupportedLanguage = "python"
    stdin: Optional[str] = ""
    interview_id: Optional[UUID] = None
    problem_title: str = "Untitled Problem"


class CodeEvaluateRequest(BaseModel):
    """Evaluate code with AI against a problem statement."""

    source_code: str
    language: SupportedLanguage = "python"
    problem_description: str
    test_cases: Optional[list[dict[str, Any]]] = None


class CodingSubmissionOut(BaseModel):
    """Coding submission resource."""

    id: UUID
    user_id: UUID
    interview_id: Optional[UUID] = None
    problem_title: str
    language: str
    source_code: str
    stdin: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    exit_code: Optional[int] = None
    execution_time_ms: Optional[int] = None
    status: str
    test_results: Optional[dict[str, Any]] = None
    ai_evaluation: Optional[dict[str, Any]] = None
    score: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
