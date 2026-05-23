"""Emotion analysis session orchestration."""

from uuid import UUID
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import EmotionSession
from app.models.user import User
from app.ml.emotion_detector import EmotionDetector


class EmotionService:
    """Manage emotion analysis sessions and persistence."""

    def __init__(self) -> None:
        self._detector = EmotionDetector()

    async def analyze_and_save(
        self,
        db: AsyncSession,
        user: User,
        frame_data: Optional[list[dict[str, Any]]] = None,
        interview_id: Optional[UUID] = None,
        image_bytes: Optional[bytes] = None,
    ) -> EmotionSession:
        """
        Run emotion detection on frames or image and persist session.

        frame_data: list of {timestamp, image_base64} or similar payloads.
        """
        analysis = self._detector.analyze_session(
            frame_data=frame_data or [],
            image_bytes=image_bytes,
        )

        session = EmotionSession(
            user_id=user.id,
            interview_id=interview_id,
            dominant_emotion=analysis.get("dominant_emotion"),
            confidence_score=analysis.get("confidence_score"),
            frame_count=analysis.get("frame_count", 0),
            emotion_timeline=analysis.get("emotion_timeline"),
            summary=analysis.get("summary"),
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session

    async def get_session(
        self, db: AsyncSession, session_id: UUID, user_id: UUID
    ) -> Optional[EmotionSession]:
        """Fetch emotion session by ID for user."""
        from sqlalchemy import select

        result = await db.execute(
            select(EmotionSession).where(
                EmotionSession.id == session_id,
                EmotionSession.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()


emotion_service = EmotionService()
