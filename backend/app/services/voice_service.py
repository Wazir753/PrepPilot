"""Voice analysis session orchestration."""

from uuid import UUID
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import VoiceSession
from app.models.user import User
from app.ml.voice_analyzer import VoiceAnalyzer
from app.ml.filler_word_detector import FillerWordDetector
from app.ml.confidence_scorer import ConfidenceScorer


class VoiceService:
    """Analyze voice metrics and persist voice sessions."""

    def __init__(self) -> None:
        self._analyzer = VoiceAnalyzer()
        self._filler_detector = FillerWordDetector()
        self._confidence = ConfidenceScorer()

    async def analyze_and_save(
        self,
        db: AsyncSession,
        user: User,
        transcript: Optional[str] = None,
        audio_bytes: Optional[bytes] = None,
        audio_url: Optional[str] = None,
        interview_id: Optional[UUID] = None,
    ) -> VoiceSession:
        """Run voice analysis pipeline and store results."""
        voice_metrics = self._analyzer.analyze(audio_bytes=audio_bytes)
        filler_count = 0
        if transcript:
            filler_count = self._filler_detector.count_fillers(transcript)

        confidence = self._confidence.score_from_metrics(
            words_per_minute=voice_metrics.get("words_per_minute"),
            filler_count=filler_count,
            pitch_variance=voice_metrics.get("pitch_variance"),
        )

        analysis = {
            "transcript_length": len(transcript) if transcript else 0,
            "filler_analysis": self._filler_detector.analyze(transcript or ""),
            "confidence_breakdown": confidence,
        }

        session = VoiceSession(
            user_id=user.id,
            interview_id=interview_id,
            audio_url=audio_url,
            duration_seconds=voice_metrics.get("duration_seconds"),
            words_per_minute=voice_metrics.get("words_per_minute"),
            filler_word_count=filler_count,
            confidence_score=confidence.get("overall_score"),
            pitch_stats=voice_metrics.get("pitch_stats"),
            analysis=analysis,
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session


voice_service = VoiceService()
