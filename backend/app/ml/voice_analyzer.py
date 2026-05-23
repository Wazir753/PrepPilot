"""Voice/audio analysis with librosa fallback to mock metrics."""

import logging
import random
import tempfile
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

_LIBROSA_AVAILABLE = False

try:
    import librosa  # type: ignore
    import numpy as np  # type: ignore

    _LIBROSA_AVAILABLE = True
except ImportError:
    logger.warning("librosa not available; using mock voice analysis")


class VoiceAnalyzer:
    """Extract pitch, pace, and duration from audio."""

    def _mock_metrics(self) -> dict[str, Any]:
        """Return plausible mock voice metrics."""
        wpm = round(random.uniform(110, 160), 1)
        return {
            "duration_seconds": round(random.uniform(30, 180), 1),
            "words_per_minute": wpm,
            "pitch_variance": round(random.uniform(0.1, 0.4), 3),
            "pitch_stats": {
                "mean_hz": round(random.uniform(85, 180), 1),
                "std_hz": round(random.uniform(10, 40), 1),
                "min_hz": 80,
                "max_hz": 250,
            },
            "mode": "mock",
        }

    def _analyze_with_librosa(self, audio_path: str) -> dict[str, Any]:
        """Analyze audio file using librosa."""
        y, sr = librosa.load(audio_path, sr=None, duration=300)
        duration = float(librosa.get_duration(y=y, sr=sr))

        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(float(pitch))

        mean_pitch = float(np.mean(pitch_values)) if pitch_values else 120.0
        std_pitch = float(np.std(pitch_values)) if pitch_values else 20.0

        estimated_words = int(duration * 2.2)
        wpm = (estimated_words / duration) * 60 if duration > 0 else 130.0

        return {
            "duration_seconds": round(duration, 2),
            "words_per_minute": round(wpm, 1),
            "pitch_variance": round(std_pitch / mean_pitch if mean_pitch else 0.2, 3),
            "pitch_stats": {
                "mean_hz": round(mean_pitch, 1),
                "std_hz": round(std_pitch, 1),
                "min_hz": round(min(pitch_values), 1) if pitch_values else 80,
                "max_hz": round(max(pitch_values), 1) if pitch_values else 250,
            },
            "mode": "librosa",
        }

    def analyze(self, audio_bytes: Optional[bytes] = None, audio_path: Optional[str] = None) -> dict[str, Any]:
        """Analyze voice from bytes or file path."""
        if not _LIBROSA_AVAILABLE or (not audio_bytes and not audio_path):
            return self._mock_metrics()

        try:
            path = audio_path
            if audio_bytes and not path:
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                    tmp.write(audio_bytes)
                    path = tmp.name

            if not path:
                return self._mock_metrics()

            result = self._analyze_with_librosa(path)
            if audio_bytes and path:
                Path(path).unlink(missing_ok=True)
            return result
        except Exception as exc:
            logger.exception("Voice analysis failed, using mock: %s", exc)
            return self._mock_metrics()
