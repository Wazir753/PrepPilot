"""Speech-to-text API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile, File

from app.api.responses import success_response, error_response
from app.dependencies import get_current_user
from app.models.user import User
from app.services.speech_service import speech_service
from app.core.exceptions import PrepPilotException

router = APIRouter(prefix="/speech", tags=["speech"])


@router.post("/transcribe")
async def transcribe(
    user: Annotated[User, Depends(get_current_user)],
    audio: UploadFile = File(...),
):
    """Transcribe uploaded audio to text."""
    try:
        content = await audio.read()
        result = await speech_service.transcribe_audio(content, audio.filename or "audio.webm")
        return success_response(result)
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
