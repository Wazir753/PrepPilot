"""Compute speaking confidence score from voice metrics."""

from typing import Any, Optional


class ConfidenceScorer:
    """Score candidate confidence from pace, fillers, and pitch stability."""

    IDEAL_WPM_MIN = 120
    IDEAL_WPM_MAX = 160
    MAX_FILLER_PENALTY = 30

    def score_from_metrics(
        self,
        words_per_minute: Optional[float] = None,
        filler_count: int = 0,
        pitch_variance: Optional[float] = None,
    ) -> dict[str, Any]:
        """
        Compute overall confidence score (0-100) from voice metrics.

        Higher is better; penalizes extreme pace and excessive fillers.
        """
        base = 75.0

        if words_per_minute is not None:
            if self.IDEAL_WPM_MIN <= words_per_minute <= self.IDEAL_WPM_MAX:
                pace_score = 100.0
            elif words_per_minute < self.IDEAL_WPM_MIN:
                pace_score = max(40, 100 - (self.IDEAL_WPM_MIN - words_per_minute) * 1.5)
            else:
                pace_score = max(40, 100 - (words_per_minute - self.IDEAL_WPM_MAX) * 1.5)
        else:
            pace_score = 70.0

        filler_penalty = min(filler_count * 3, self.MAX_FILLER_PENALTY)
        filler_score = max(0, 100 - filler_penalty)

        if pitch_variance is not None:
            stability = max(0, 100 - pitch_variance * 150)
        else:
            stability = 70.0

        overall = (pace_score * 0.35 + filler_score * 0.4 + stability * 0.25)
        overall = round(min(100, max(0, overall)), 1)

        return {
            "overall_score": overall,
            "pace_score": round(pace_score, 1),
            "filler_score": round(filler_score, 1),
            "stability_score": round(stability, 1),
            "interpretation": self._interpret(overall),
        }

    @staticmethod
    def _interpret(score: float) -> str:
        """Human-readable confidence level."""
        if score >= 85:
            return "very_confident"
        if score >= 70:
            return "confident"
        if score >= 55:
            return "moderate"
        if score >= 40:
            return "nervous"
        return "low_confidence"
