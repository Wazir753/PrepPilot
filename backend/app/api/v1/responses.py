"""Interview response (answer) API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.response_service import ResponseService
from app.schemas.response import ResponseCreate, EvaluateAnswerRequest
from app.core.exceptions import PrepPilotException

router = APIRouter(prefix="/responses", tags=["responses"])


@router.post("/interview/{interview_id}")
async def submit_response(
    interview_id: UUID,
    data: ResponseCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Submit an answer to an interview question."""
    try:
        response = await ResponseService.submit_response(db, user, interview_id, data)
        return success_response(response.model_dump(mode="json"), status_code=201)
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.get("/interview/{interview_id}")
async def list_responses(
    interview_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """List all responses for an interview."""
    try:
        responses = await ResponseService.list_responses(db, user, interview_id)
        return success_response([r.model_dump(mode="json") for r in responses])
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.post("/{response_id}/evaluate")
async def evaluate_response(
    response_id: UUID,
    body: EvaluateAnswerRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """AI-evaluate a submitted response."""
    try:
        result = await ResponseService.evaluate_response(
            db, user, response_id, body.role, body.difficulty
        )
        return success_response(result.model_dump(mode="json"))
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
