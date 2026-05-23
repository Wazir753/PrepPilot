"""Detect filler words in speech transcripts."""

import re
from typing import Any

DEFAULT_FILLERS = [
    "um", "uh", "er", "ah", "like", "you know", "basically",
    "actually", "literally", "sort of", "kind of", "i mean",
]


class FillerWordDetector:
    """Count and analyze filler words in text."""

    def __init__(self, fillers: list[str] | None = None) -> None:
        self.fillers = fillers or DEFAULT_FILLERS
        self._patterns = [
            re.compile(rf"\b{re.escape(f)}\b", re.IGNORECASE) for f in self.fillers
        ]

    def count_fillers(self, text: str) -> int:
        """Return total filler word occurrences in text."""
        if not text:
            return 0
        total = 0
        for pattern in self._patterns:
            total += len(pattern.findall(text))
        return total

    def analyze(self, text: str) -> dict[str, Any]:
        """Detailed filler word breakdown."""
        if not text:
            return {"total": 0, "by_word": {}, "density_per_100_words": 0.0}

        words = text.split()
        word_count = max(len(words), 1)
        by_word: dict[str, int] = {}

        for filler, pattern in zip(self.fillers, self._patterns):
            count = len(pattern.findall(text))
            if count:
                by_word[filler] = count

        total = sum(by_word.values())
        return {
            "total": total,
            "by_word": by_word,
            "density_per_100_words": round((total / word_count) * 100, 2),
        }
