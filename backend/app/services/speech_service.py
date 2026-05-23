"""Speech-to-text via OpenAI Whisper."""

import logging
import tempfile
from pathlib import Path
from typing import Optional

from openai import AsyncOpenAI

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError, ValidationError

logger = logging.getLogger(__name__)


class SpeechService:
    """Transcribe audio files using Whisper API."""

    def __init__(self) -> None:
        self._client: Optional[AsyncOpenAI] = None

    @property
    def client(self) -> AsyncOpenAI:
        """Lazy-init OpenAI client."""
        if self._client is None:
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.webm") -> dict:
        """
        Transcribe audio bytes to text.

        Returns dict with text, language, and duration estimate.
        """
        max_bytes = settings.MAX_AUDIO_FILE_SIZE_MB * 1024 * 1024
        if len(audio_bytes) > max_bytes:
            raise ValidationError(
                f"Audio file exceeds {settings.MAX_AUDIO_FILE_SIZE_MB}MB limit"
            )

        suffix = Path(filename).suffix or ".webm"
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            with open(tmp_path, "rb") as audio_file:
                response = await self.client.audio.transcriptions.create(
                    model=settings.WHISPER_MODEL,
                    file=audio_file,
                    response_format="verbose_json",
                )

            Path(tmp_path).unlink(missing_ok=True)

            return {
                "text": response.text,
                "language": getattr(response, "language", "en"),
                "duration": getattr(response, "duration", None),
            }
        except ValidationError:
            raise
        except Exception as exc:
            logger.exception("Transcription failed: %s", exc)
            raise ServiceUnavailableError("Speech transcription unavailable") from exc


speech_service = SpeechService()
