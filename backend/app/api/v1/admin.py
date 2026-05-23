"""Admin API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_admin_user
from app.models.user import User
from app.models.interview import Interview
from app.core.exceptions import PrepPilotException, NotFoundError

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_admin_user)],
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List all users (admin only)."""
    try:
        result = await db.execute(
            select(User).order_by(User.created_at.desc()).limit(limit).offset(offset)
        )
        users = result.scalars().all()
        return success_response(
            [
                {
                    "id": str(u.id),
                    "name": u.name,
                    "email": u.email,
                    "role": u.role,
                    "is_active": u.is_active,
                    "is_banned": u.is_banned,
                    "subscription_tier": u.subscription_tier,
                }
                for u in users
            ]
        )
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.patch("/users/{user_id}/ban")
async def ban_user(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_admin_user)],
):
    """Ban a user account."""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        user.is_banned = True
        await db.flush()
        return success_response({"id": str(user.id), "is_banned": True})
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.patch("/users/{user_id}/unban")
async def unban_user(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_admin_user)],
):
    """Unban a user account."""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        user.is_banned = False
        await db.flush()
        return success_response({"id": str(user.id), "is_banned": False})
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.get("/stats")
async def platform_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_admin_user)],
):
    """Platform-wide statistics."""
    try:
        user_count = await db.execute(select(func.count(User.id)))
        interview_count = await db.execute(select(func.count(Interview.id)))
        completed = await db.execute(
            select(func.count(Interview.id)).where(Interview.status == "completed")
        )
        return success_response(
            {
                "total_users": user_count.scalar() or 0,
                "total_interviews": interview_count.scalar() or 0,
                "completed_interviews": completed.scalar() or 0,
            }
        )
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
