"""User analytics aggregation and AI-powered insights."""

from uuid import UUID
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview import Interview
from app.models.response import Response
from app.models.analytics import EmotionSession, VoiceSession
from app.models.user import User
from app.services.ai_service import ai_service
from app.schemas.analytics import UserAnalyticsSummary


class AnalyticsService:
    """Dashboard analytics and hiring recommendations."""

    @staticmethod
    async def get_user_summary(db: AsyncSession, user_id: UUID) -> UserAnalyticsSummary:
        """Aggregate interview and session metrics for a user."""
        interview_stats = await db.execute(
            select(
                func.count(Interview.id),
                func.count(Interview.id).filter(Interview.status == "completed"),
                func.avg(Interview.final_score),
                func.avg(Interview.technical_score),
                func.avg(Interview.communication_score),
            ).where(Interview.user_id == user_id)
        )
        row = interview_stats.one()

        recent = await db.execute(
            select(Interview.final_score)
            .where(
                Interview.user_id == user_id,
                Interview.status == "completed",
                Interview.final_score.isnot(None),
            )
            .order_by(Interview.completed_at.desc())
            .limit(10)
        )
        recent_scores = [float(s) for s in recent.scalars().all() if s is not None]

        emotion_agg = await db.execute(
            select(func.avg(EmotionSession.confidence_score)).where(
                EmotionSession.user_id == user_id
            )
        )
        emotion_avg = emotion_agg.scalar()

        latest_emotion = await db.execute(
            select(EmotionSession.dominant_emotion)
            .where(EmotionSession.user_id == user_id)
            .order_by(EmotionSession.created_at.desc())
            .limit(1)
        )
        dominant_emotion = latest_emotion.scalar()

        voice_agg = await db.execute(
            select(
                func.avg(VoiceSession.words_per_minute),
                func.avg(VoiceSession.filler_word_count),
                func.avg(VoiceSession.confidence_score),
            ).where(VoiceSession.user_id == user_id)
        )
        voice_row = voice_agg.one()

        return UserAnalyticsSummary(
            total_interviews=row[0] or 0,
            completed_interviews=row[1] or 0,
            average_score=float(row[2]) if row[2] is not None else None,
            average_technical_score=float(row[3]) if row[3] is not None else None,
            average_communication_score=float(row[4]) if row[4] is not None else None,
            recent_scores=recent_scores,
            emotion_summary={
                "avg_confidence": float(emotion_avg) if emotion_avg else None,
                "dominant_emotion": dominant_emotion,
            },
            voice_summary={
                "avg_wpm": float(voice_row[0]) if voice_row[0] else None,
                "avg_fillers": float(voice_row[1]) if voice_row[1] else None,
                "avg_confidence": float(voice_row[2]) if voice_row[2] else None,
            },
        )

    @staticmethod
    async def generate_roadmap(
        target_role: str,
        current_skills: list[str] | None = None,
        weak_areas: list[str] | None = None,
    ) -> dict[str, Any]:
        """Generate AI learning roadmap."""
        return await ai_service.generate_roadmap(
            target_role=target_role,
            current_skills=current_skills or [],
            weak_areas=weak_areas or [],
        )

    @staticmethod
    async def hiring_recommendation(
        db: AsyncSession, user_id: UUID, interview_ids: list[UUID], role: str
    ) -> dict[str, Any]:
        """Build performance summary and get hiring recommendation."""
        result = await db.execute(
            select(Interview).where(
                Interview.id.in_(interview_ids),
                Interview.user_id == user_id,
            )
        )
        interviews = result.scalars().all()
        if not interviews:
            return await ai_service.hiring_recommendation(
                role=role,
                performance_summary="No interview data available.",
            )

        lines = []
        for inv in interviews:
            resp_result = await db.execute(
                select(func.avg(Response.score)).where(Response.interview_id == inv.id)
            )
            avg_resp = resp_result.scalar()
            lines.append(
                f"Interview {inv.id}: type={inv.interview_type}, "
                f"difficulty={inv.difficulty}, final={inv.final_score}, "
                f"avg_response={avg_resp}"
            )

        summary = "\n".join(lines)
        return await ai_service.hiring_recommendation(role=role, performance_summary=summary)
