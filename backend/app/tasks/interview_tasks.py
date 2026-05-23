"""Background Celery tasks for interview processing."""

import asyncio
import logging
from uuid import UUID

from app.tasks.celery_app import celery_app
from app.database.session import async_session_maker
from app.services.notification_service import notification_service
from app.services.interview_service import InterviewService

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Run async coroutine from sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="interview.complete_notification")
def send_interview_complete_notification(
    user_id: str, interview_id: str, score: float | None
) -> dict:
    """Send notification after interview completion."""

    async def _notify():
        await notification_service.notify_interview_complete(
            UUID(user_id), UUID(interview_id), score
        )

    _run_async(_notify())
    logger.info("Interview complete notification sent for %s", interview_id)
    return {"status": "sent", "interview_id": interview_id}


@celery_app.task(name="interview.invalidate_leaderboard")
def invalidate_leaderboard_cache() -> dict:
    """Clear leaderboard cache in Redis."""

    async def _invalidate():
        from app.database.redis import get_redis

        redis = await get_redis()
        await redis.delete("leaderboard:global")

    _run_async(_invalidate())
    return {"status": "invalidated"}


@celery_app.task(name="interview.process_post_complete")
def process_post_interview_complete(
    user_id: str, interview_id: str, duration_seconds: int | None = None
) -> dict:
    """Post-processing after interview: notifications and cache invalidation."""

    async def _process():
        async with async_session_maker() as db:
            interview = await InterviewService.complete_interview(
                db, UUID(interview_id), UUID(user_id), duration_seconds
            )
            await db.commit()
            await notification_service.notify_interview_complete(
                UUID(user_id), UUID(interview_id), interview.final_score
            )
        from app.database.redis import get_redis

        redis = await get_redis()
        await redis.delete("leaderboard:global")

    _run_async(_process())
    return {"status": "processed", "interview_id": interview_id}
