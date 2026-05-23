"""Interview response (answer) submission and evaluation."""

from uuid import UUID
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ForbiddenError
from app.models.response import Response
from app.models.interview import Interview
from app.models.user import User
from app.services.ai_service import ai_service
from app.services.interview_service import InterviewService
from app.schemas.response import ResponseCreate, ResponseOut


class ResponseService:
    """Handle answer submission and AI evaluation."""

    @staticmethod
    async def submit_response(
        db: AsyncSession,
        user: User,
        interview_id: UUID,
        data: ResponseCreate,
    ) -> ResponseOut:
        """Save a candidate's answer to an interview question."""
        await InterviewService.get_interview(db, interview_id, user.id)

        response = Response(
            interview_id=interview_id,
            question_number=data.question_number,
            question_text=data.question_text,
            answer_text=data.answer_text,
            audio_url=data.audio_url,
            response_time_seconds=data.response_time_seconds,
        )
        db.add(response)
        await db.flush()
        await db.refresh(response)
        return ResponseOut.model_validate(response)

    @staticmethod
    async def evaluate_response(
        db: AsyncSession,
        user: User,
        response_id: UUID,
        role: str,
        difficulty: str = "medium",
    ) -> ResponseOut:
        """Run AI evaluation on a stored response."""
        result = await db.execute(select(Response).where(Response.id == response_id))
        response = result.scalar_one_or_none()
        if not response:
            raise NotFoundError("Response not found")

        inv_result = await db.execute(
            select(Interview).where(Interview.id == response.interview_id)
        )
        interview = inv_result.scalar_one_or_none()
        if not interview or interview.user_id != user.id:
            raise ForbiddenError("Not your response")

        evaluation = await ai_service.evaluate_answer(
            role=role or interview.role,
            difficulty=difficulty or interview.difficulty,
            question_text=response.question_text,
            answer_text=response.answer_text or "",
        )

        response.score = evaluation.get("score")
        response.technical_score = evaluation.get("technical_score")
        response.communication_score = evaluation.get("communication_score")
        response.ai_feedback = evaluation.get("feedback", evaluation)
        await db.flush()
        await db.refresh(response)
        return ResponseOut.model_validate(response)

    @staticmethod
    async def list_responses(
        db: AsyncSession, user: User, interview_id: UUID
    ) -> list[ResponseOut]:
        """List all responses for an interview."""
        await InterviewService.get_interview(db, interview_id, user.id)
        result = await db.execute(
            select(Response)
            .where(Response.interview_id == interview_id)
            .order_by(Response.question_number)
        )
        return [ResponseOut.model_validate(r) for r in result.scalars().all()]
