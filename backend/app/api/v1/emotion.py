"""Emotion analysis API routes."""

from typing import Annotated, Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.emotion_service import emotion_service
from app.schemas.analytics import EmotionSessionOut
from app.core.exceptions import PrepPilotException, NotFoundError

router = APIRouter(prefix="/emotion", tags=["emotion"])


class EmotionAnalyzeRequest(BaseModel):
    """Request body for emotion analysis."""

    interview_id: Optional[UUID] = None
    frame_data: Optional[list[dict[str, Any]]] = None


@router.post("/analyze")
async def analyze_emotion(
    body: EmotionAnalyzeRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Analyze facial emotions from frame data."""
    try:
        session = await emotion_service.analyze_and_save(
            db=db,
            user=user,
            frame_data=body.frame_data,
            interview_id=body.interview_id,
        )
        return success_response(
            EmotionSessionOut.model_validate(session).model_dump(mode="json"),
            status_code=201,
        )
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.get("/sessions/{session_id}")
async def get_emotion_session(
    session_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Get emotion session by ID."""
    try:
        session = await emotion_service.get_session(db, session_id, user.id)
        if not session:
            raise NotFoundError("Emotion session not found")
        return success_response(
            EmotionSessionOut.model_validate(session).model_dump(mode="json")
        )
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
