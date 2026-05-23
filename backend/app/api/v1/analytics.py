"""Analytics and insights API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.interview import Interview
from app.models.response import Response as ResponseModel
from app.services.analytics_service import AnalyticsService
from app.services.pdf_service import pdf_service
from app.schemas.analytics import RoadmapRequest, HiringRecommendationRequest
from app.core.exceptions import PrepPilotException, NotFoundError

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def user_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Get aggregated analytics for current user."""
    try:
        summary = await AnalyticsService.get_user_summary(db, user.id)
        return success_response(summary.model_dump(mode="json"))
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.post("/roadmap")
async def roadmap(
    body: RoadmapRequest,
    user: Annotated[User, Depends(get_current_user)],
):
    """Generate personalized learning roadmap."""
    try:
        result = await AnalyticsService.generate_roadmap(
            target_role=body.target_role,
            current_skills=body.current_skills,
            weak_areas=body.weak_areas,
        )
        return success_response(result)
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.post("/hiring-recommendation")
async def hiring_recommendation(
    body: HiringRecommendationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Get AI hiring recommendation from interview history."""
    try:
        result = await AnalyticsService.hiring_recommendation(
            db, user.id, body.interview_ids, body.role
        )
        return success_response(result)
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.get("/report/{interview_id}/pdf")
async def download_pdf_report(
    interview_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Download PDF interview report."""
    try:
        inv_result = await db.execute(
            select(Interview).where(
                Interview.id == interview_id, Interview.user_id == user.id
            )
        )
        interview = inv_result.scalar_one_or_none()
        if not interview:
            raise NotFoundError("Interview not found")

        resp_result = await db.execute(
            select(ResponseModel).where(ResponseModel.interview_id == interview_id)
        )
        responses = [
            {
                "question_number": r.question_number,
                "question_text": r.question_text,
                "answer_text": r.answer_text,
                "score": r.score,
                "technical_score": r.technical_score,
                "communication_score": r.communication_score,
            }
            for r in resp_result.scalars().all()
        ]

        pdf_bytes = pdf_service.generate_interview_report(
            user_name=user.name,
            interview_data={
                "role": interview.role,
                "interview_type": interview.interview_type,
                "difficulty": interview.difficulty,
                "final_score": interview.final_score,
                "technical_score": interview.technical_score,
                "communication_score": interview.communication_score,
                "status": interview.status,
            },
            responses=responses,
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=interview_{interview_id}.pdf"},
        )
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
