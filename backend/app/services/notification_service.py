"""Notification delivery (email stub + in-app queue via Redis)."""

import json
import logging
from typing import Any, Optional
from uuid import UUID

from app.database.redis import get_redis

logger = logging.getLogger(__name__)

NOTIFICATION_QUEUE = "notifications:queue"


class NotificationService:
    """Queue and send user notifications."""

    @staticmethod
    async def enqueue(
        user_id: UUID,
        title: str,
        body: str,
        notification_type: str = "info",
        metadata: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Push notification to Redis queue for async delivery."""
        payload = {
            "user_id": str(user_id),
            "title": title,
            "body": body,
            "type": notification_type,
            "metadata": metadata or {},
        }
        redis = await get_redis()
        await redis.lpush(NOTIFICATION_QUEUE, json.dumps(payload))
        logger.info("Notification queued for user %s: %s", user_id, title)
        return payload

    @staticmethod
    async def notify_interview_complete(
        user_id: UUID, interview_id: UUID, score: Optional[float]
    ) -> dict[str, Any]:
        """Send interview completion notification."""
        score_text = f"{score:.1f}" if score is not None else "pending"
        return await NotificationService.enqueue(
            user_id=user_id,
            title="Interview Complete",
            body=f"Your interview has been completed. Final score: {score_text}",
            notification_type="interview_complete",
            metadata={"interview_id": str(interview_id), "score": score},
        )

    @staticmethod
    async def send_email(to: str, subject: str, html_body: str) -> bool:
        """
        Send email notification (stub for production SMTP integration).

        Returns True if queued successfully.
        """
        logger.info("Email queued to %s: %s", to, subject)
        return True


notification_service = NotificationService()
