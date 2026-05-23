"""Interview question generation routes."""

from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.interview_service import InterviewService
from app.schemas.interview import NextQuestionRequest
from app.core.exceptions import PrepPilotException

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("/{interview_id}/next")
async def next_question(
    interview_id: UUID,
    body: NextQuestionRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Generate next adaptive interview question."""
    try:
        question = await InterviewService.next_question(
            db, interview_id, user.id, body.previous_score
        )
        return success_response(question.model_dump(mode="json"))
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
