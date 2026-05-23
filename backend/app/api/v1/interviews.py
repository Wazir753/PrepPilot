"""Interview session API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.interview_service import InterviewService
from app.schemas.interview import InterviewCreate, InterviewCompleteRequest
from app.core.exceptions import PrepPilotException

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.post("")
async def create_interview(
    data: InterviewCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Start a new interview session."""
    try:
        interview = await InterviewService.create_interview(db, user, data)
        return success_response(interview.model_dump(mode="json"), status_code=201)
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.get("/leaderboard/global")
async def leaderboard(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(10, ge=1, le=50),
):
    """Get global leaderboard (cached 5 min)."""
    try:
        entries = await InterviewService.get_leaderboard(db, limit)
        return success_response([e.model_dump(mode="json") for e in entries])
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.get("")
async def list_interviews(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """List user's interviews."""
    try:
        interviews = await InterviewService.list_interviews(db, user.id, limit, offset)
        return success_response([i.model_dump(mode="json") for i in interviews])
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.get("/{interview_id}")
async def get_interview(
    interview_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Get interview by ID."""
    try:
        interview = await InterviewService.get_interview(db, interview_id, user.id)
        from app.schemas.interview import InterviewResponse

        return success_response(InterviewResponse.model_validate(interview).model_dump(mode="json"))
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.post("/{interview_id}/complete")
async def complete_interview(
    interview_id: UUID,
    body: InterviewCompleteRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Complete an interview and compute scores."""
    try:
        interview = await InterviewService.complete_interview(
            db, interview_id, user.id, body.duration_seconds
        )
        from app.services.notification_service import notification_service

        await notification_service.notify_interview_complete(
            user.id, interview_id, interview.final_score
        )
        return success_response(interview.model_dump(mode="json"))
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
