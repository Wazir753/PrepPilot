"""Interview session management with adaptive difficulty."""

import json
from datetime import datetime, timezone
from uuid import UUID
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ForbiddenError
from app.models.interview import Interview
from app.models.response import Response
from app.models.user import User
from app.services.ai_service import ai_service
from app.database.redis import get_redis
from app.schemas.interview import (
    InterviewCreate,
    InterviewResponse as InterviewSchema,
    QuestionPayload,
    LeaderboardEntry,
)

LEADERBOARD_KEY = "leaderboard:global"
LEADERBOARD_TTL = 300  # 5 minutes

DIFFICULTY_ORDER = ["easy", "medium", "hard"]


class InterviewService:
    """Business logic for interviews and adaptive questioning."""

    @staticmethod
    def _adjust_difficulty(current: str, previous_score: Optional[float]) -> str:
        """Increase or decrease difficulty based on last answer score."""
        if previous_score is None:
            return current
        idx = DIFFICULTY_ORDER.index(current) if current in DIFFICULTY_ORDER else 1
        if previous_score >= 80 and idx < len(DIFFICULTY_ORDER) - 1:
            return DIFFICULTY_ORDER[idx + 1]
        if previous_score < 50 and idx > 0:
            return DIFFICULTY_ORDER[idx - 1]
        return current

    @staticmethod
    async def create_interview(
        db: AsyncSession, user: User, data: InterviewCreate
    ) -> InterviewSchema:
        """Start a new interview session."""
        interview = Interview(
            user_id=user.id,
            role=data.role,
            difficulty=data.difficulty,
            interview_type=data.interview_type,
        )
        db.add(interview)
        await db.flush()
        await db.refresh(interview)
        return InterviewSchema.model_validate(interview)

    @staticmethod
    async def get_interview(
        db: AsyncSession, interview_id: UUID, user_id: UUID
    ) -> Interview:
        """Load interview ensuring ownership."""
        result = await db.execute(select(Interview).where(Interview.id == interview_id))
        interview = result.scalar_one_or_none()
        if not interview:
            raise NotFoundError("Interview not found")
        if interview.user_id != user_id:
            raise ForbiddenError("Not your interview")
        return interview

    @staticmethod
    async def list_interviews(
        db: AsyncSession, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[InterviewSchema]:
        """List user's interviews."""
        result = await db.execute(
            select(Interview)
            .where(Interview.user_id == user_id)
            .order_by(Interview.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return [InterviewSchema.model_validate(i) for i in result.scalars().all()]

    @staticmethod
    async def next_question(
        db: AsyncSession,
        interview_id: UUID,
        user_id: UUID,
        previous_score: Optional[float] = None,
    ) -> QuestionPayload:
        """Generate next question with adaptive difficulty."""
        interview = await InterviewService.get_interview(db, interview_id, user_id)
        if interview.status != "in_progress":
            raise ForbiddenError("Interview is not in progress")

        new_difficulty = InterviewService._adjust_difficulty(
            interview.difficulty, previous_score
        )
        if new_difficulty != interview.difficulty:
            interview.difficulty = new_difficulty

        question_number = interview.question_count + 1
        generated = await ai_service.generate_question(
            role=interview.role,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            question_number=question_number,
        )

        interview.question_count = question_number
        await db.flush()

        return QuestionPayload(
            question_number=question_number,
            question_text=generated["question_text"],
            difficulty=interview.difficulty,
            category=generated.get("category"),
        )

    @staticmethod
    async def complete_interview(
        db: AsyncSession,
        interview_id: UUID,
        user_id: UUID,
        duration_seconds: Optional[int] = None,
    ) -> InterviewSchema:
        """Mark interview complete and compute aggregate scores."""
        interview = await InterviewService.get_interview(db, interview_id, user_id)

        scores = await db.execute(
            select(
                func.avg(Response.score),
                func.avg(Response.technical_score),
                func.avg(Response.communication_score),
            ).where(Response.interview_id == interview_id)
        )
        row = scores.one()
        interview.final_score = float(row[0]) if row[0] is not None else None
        interview.technical_score = float(row[1]) if row[1] is not None else None
        interview.communication_score = float(row[2]) if row[2] is not None else None
        interview.status = "completed"
        interview.completed_at = datetime.now(timezone.utc)
        if duration_seconds is not None:
            interview.duration_seconds = duration_seconds

        await db.flush()
        await db.refresh(interview)

        redis = await get_redis()
        await redis.delete(LEADERBOARD_KEY)

        return InterviewSchema.model_validate(interview)

    @staticmethod
    async def get_leaderboard(db: AsyncSession, limit: int = 10) -> list[LeaderboardEntry]:
        """Return cached global leaderboard by average interview score."""
        redis = await get_redis()
        cached = await redis.get(LEADERBOARD_KEY)
        if cached:
            data = json.loads(cached)
            return [LeaderboardEntry(**entry) for entry in data[:limit]]

        result = await db.execute(
            select(
                User.id,
                User.name,
                func.avg(Interview.final_score).label("avg_score"),
                func.count(Interview.id).label("cnt"),
            )
            .join(Interview, Interview.user_id == User.id)
            .where(Interview.status == "completed", Interview.final_score.isnot(None))
            .group_by(User.id, User.name)
            .order_by(func.avg(Interview.final_score).desc())
            .limit(50)
        )
        rows = result.all()
        entries = [
            LeaderboardEntry(
                user_id=row.id,
                name=row.name,
                average_score=round(float(row.avg_score), 2),
                interview_count=row.cnt,
                rank=idx + 1,
            )
            for idx, row in enumerate(rows)
        ]
        await redis.setex(
            LEADERBOARD_KEY,
            LEADERBOARD_TTL,
            json.dumps([e.model_dump(mode="json") for e in entries]),
        )
        return entries[:limit]
