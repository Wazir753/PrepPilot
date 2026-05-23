"""Authentication service: registration, login, refresh tokens via Redis."""

import json
from uuid import UUID
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError

from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.exceptions import UnauthorizedError, ConflictError, NotFoundError
from app.models.user import User
from app.database.redis import get_redis
from app.schemas.auth import UserCreate, UserResponse, Token

REFRESH_TOKEN_PREFIX = "refresh_token:"


class AuthService:
    """Handle user auth flows and token lifecycle."""

    @staticmethod
    async def register(db: AsyncSession, user_in: UserCreate) -> UserResponse:
        """Create a new user account."""
        existing = await db.execute(select(User).where(User.email == user_in.email))
        if existing.scalar_one_or_none():
            raise ConflictError("Email already registered")

        user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            bio=user_in.bio,
            target_role=user_in.target_role,
            avatar_url=user_in.avatar_url,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return UserResponse.model_validate(user)

    @staticmethod
    async def login(db: AsyncSession, email: str, password: str) -> Token:
        """Authenticate user and return access + refresh tokens."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active or user.is_banned:
            raise UnauthorizedError("Account is inactive or banned")

        access = create_access_token({"sub": str(user.id), "role": user.role})
        refresh = create_refresh_token({"sub": str(user.id), "type": "refresh"})

        redis = await get_redis()
        ttl_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
        await redis.setex(
            f"{REFRESH_TOKEN_PREFIX}{user.id}",
            ttl_seconds,
            refresh,
        )
        return Token(access_token=access, refresh_token=refresh)

    @staticmethod
    async def refresh_access_token(db: AsyncSession, refresh_token: str) -> Token:
        """Validate refresh token in Redis and issue new access token."""
        try:
            payload = jwt.decode(
                refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            user_id = payload.get("sub")
            if not user_id or payload.get("type") != "refresh":
                raise UnauthorizedError("Invalid refresh token")
        except JWTError as exc:
            raise UnauthorizedError("Invalid refresh token") from exc

        redis = await get_redis()
        stored = await redis.get(f"{REFRESH_TOKEN_PREFIX}{user_id}")
        if not stored or stored != refresh_token:
            raise UnauthorizedError("Refresh token revoked or expired")

        result = await db.execute(select(User).where(User.id == UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")

        access = create_access_token({"sub": str(user.id), "role": user.role})
        new_refresh = create_refresh_token({"sub": str(user.id), "type": "refresh"})
        ttl_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
        await redis.setex(f"{REFRESH_TOKEN_PREFIX}{user_id}", ttl_seconds, new_refresh)

        return Token(access_token=access, refresh_token=new_refresh)

    @staticmethod
    async def logout(user_id: UUID) -> None:
        """Revoke refresh token for user."""
        redis = await get_redis()
        await redis.delete(f"{REFRESH_TOKEN_PREFIX}{user_id}")

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: UUID) -> UserResponse:
        """Fetch user profile by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        return UserResponse.model_validate(user)
