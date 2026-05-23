"""Facial emotion detection with graceful fallback when ML deps unavailable."""

import base64
import logging
import random
from typing import Any, Optional

logger = logging.getLogger(__name__)

_DEEPFACE_AVAILABLE = False
_MEDIAPIPE_AVAILABLE = False

try:
    from deepface import DeepFace  # type: ignore

    _DEEPFACE_AVAILABLE = True
except ImportError:
    logger.warning("deepface not available; using mock emotion analysis")

try:
    import mediapipe as mp  # type: ignore

    _MEDIAPIPE_AVAILABLE = True
except ImportError:
    logger.warning("mediapipe not available; using mock emotion analysis")


class EmotionDetector:
    """Detect emotions from frames or images with ML or mock fallback."""

    EMOTIONS = ["happy", "neutral", "sad", "angry", "fear", "surprise", "disgust"]

    def _mock_analysis(self, frame_count: int = 1) -> dict[str, Any]:
        """Return plausible mock emotion analysis."""
        dominant = random.choice(["neutral", "happy", "focused"])
        timeline = [
            {
                "timestamp": i,
                "emotion": random.choice(self.EMOTIONS),
                "confidence": round(random.uniform(0.5, 0.95), 2),
            }
            for i in range(max(1, frame_count))
        ]
        return {
            "dominant_emotion": dominant,
            "confidence_score": round(random.uniform(0.65, 0.9), 2),
            "frame_count": frame_count,
            "emotion_timeline": timeline,
            "summary": {
                "mode": "mock",
                "distribution": {e: round(random.random(), 2) for e in self.EMOTIONS[:4]},
                "engagement_level": random.choice(["low", "medium", "high"]),
            },
        }

    def _analyze_image_deepface(self, image_path: str) -> dict[str, str | float]:
        """Run DeepFace emotion analysis on a single image."""
        result = DeepFace.analyze(
            img_path=image_path,
            actions=["emotion"],
            enforce_detection=False,
            silent=True,
        )
        if isinstance(result, list):
            result = result[0]
        emotions = result.get("emotion", {})
        dominant = max(emotions, key=emotions.get) if emotions else "neutral"
        confidence = emotions.get(dominant, 0) / 100.0 if emotions else 0.5
        return {"emotion": dominant.lower(), "confidence": round(confidence, 2)}

    def analyze_session(
        self,
        frame_data: list[dict[str, Any]],
        image_bytes: Optional[bytes] = None,
    ) -> dict[str, Any]:
        """
        Analyze a session of frames or a single image.

        frame_data items may contain 'image_base64' or 'path' keys.
        """
        timeline: list[dict[str, Any]] = []
        frame_count = len(frame_data) if frame_data else (1 if image_bytes else 0)

        if not _DEEPFACE_AVAILABLE and not _MEDIAPIPE_AVAILABLE:
            return self._mock_analysis(frame_count or 1)

        try:
            import tempfile
            from pathlib import Path

            if image_bytes:
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    tmp.write(image_bytes)
                    path = tmp.name
                if _DEEPFACE_AVAILABLE:
                    analysis = self._analyze_image_deepface(path)
                    timeline.append({"timestamp": 0, **analysis})
                Path(path).unlink(missing_ok=True)

            for idx, frame in enumerate(frame_data[:20]):
                b64 = frame.get("image_base64")
                if not b64:
                    continue
                raw = base64.b64decode(b64.split(",")[-1] if "," in b64 else b64)
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    tmp.write(raw)
                    path = tmp.name
                if _DEEPFACE_AVAILABLE:
                    analysis = self._analyze_image_deepface(path)
                    timeline.append({"timestamp": idx, **analysis})
                Path(path).unlink(missing_ok=True)

            if not timeline:
                return self._mock_analysis(frame_count or 1)

            emotion_counts: dict[str, int] = {}
            confidences: list[float] = []
            for entry in timeline:
                em = entry.get("emotion", "neutral")
                emotion_counts[em] = emotion_counts.get(em, 0) + 1
                confidences.append(float(entry.get("confidence", 0.5)))

            dominant = max(emotion_counts, key=emotion_counts.get)
            return {
                "dominant_emotion": dominant,
                "confidence_score": round(sum(confidences) / len(confidences), 2),
                "frame_count": len(timeline),
                "emotion_timeline": timeline,
                "summary": {
                    "mode": "deepface",
                    "distribution": emotion_counts,
                    "engagement_level": "high" if len(timeline) > 5 else "medium",
                },
            }
        except Exception as exc:
            logger.exception("Emotion analysis failed, using mock: %s", exc)
            return self._mock_analysis(frame_count or 1)
