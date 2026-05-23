"""Local heuristic answer evaluation fallback when AI is unavailable."""

import re
from typing import Any


class AnswerEvaluator:
    """Rule-based answer scoring as offline fallback."""

    def evaluate(
        self,
        question_text: str,
        answer_text: str,
        expected_keywords: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Score answer using length, structure, and keyword matching.

        Returns scores 0-100 compatible with AI evaluation schema.
        """
        if not answer_text or not answer_text.strip():
            return self._empty_result()

        words = answer_text.split()
        word_count = len(words)

        length_score = min(100, word_count * 2) if word_count < 50 else 85
        if word_count < 10:
            length_score = max(20, word_count * 5)

        structure_score = 50
        if re.search(r"\b(first|second|then|finally|because|therefore)\b", answer_text, re.I):
            structure_score += 20
        if re.search(r"\b(for example|such as|specifically)\b", answer_text, re.I):
            structure_score += 15
        structure_score = min(100, structure_score)

        keyword_score = 60
        if expected_keywords:
            matches = sum(
                1 for kw in expected_keywords
                if kw.lower() in answer_text.lower()
            )
            keyword_score = min(100, 40 + matches * 20)

        technical_score = round((length_score * 0.3 + keyword_score * 0.7), 1)
        communication_score = round((length_score * 0.4 + structure_score * 0.6), 1)
        overall = round((technical_score + communication_score) / 2, 1)

        return {
            "technical_score": technical_score,
            "communication_score": communication_score,
            "score": overall,
            "feedback": {
                "strengths": ["Provided a substantive response"] if word_count >= 30 else [],
                "improvements": (
                    ["Expand with more specific examples"] if word_count < 50 else []
                ),
                "summary": f"Heuristic evaluation (word count: {word_count})",
            },
            "hiring_signal": "neutral" if overall >= 50 else "no",
            "mode": "heuristic",
        }

    @staticmethod
    def _empty_result() -> dict[str, Any]:
        """Scores for empty answers."""
        return {
            "technical_score": 0,
            "communication_score": 0,
            "score": 0,
            "feedback": {
                "strengths": [],
                "improvements": ["Provide a complete answer"],
                "summary": "No answer provided",
            },
            "hiring_signal": "strong_no",
            "mode": "heuristic",
        }
