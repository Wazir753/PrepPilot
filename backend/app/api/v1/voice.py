"""Voice analysis API routes."""

from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.voice_service import voice_service
from app.schemas.analytics import VoiceSessionOut
from app.core.exceptions import PrepPilotException

router = APIRouter(prefix="/voice", tags=["voice"])


class VoiceAnalyzeRequest(BaseModel):
    """Request body for voice analysis."""

    interview_id: Optional[UUID] = None
    audio_url: Optional[str] = None
    transcript: Optional[str] = None


@router.post("/analyze")
async def analyze_voice(
    body: VoiceAnalyzeRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Analyze voice metrics from transcript or audio."""
    try:
        session = await voice_service.analyze_and_save(
            db=db,
            user=user,
            transcript=body.transcript,
            audio_url=body.audio_url,
            interview_id=body.interview_id,
        )
        return success_response(
            VoiceSessionOut.model_validate(session).model_dump(mode="json"),
            status_code=201,
        )
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
