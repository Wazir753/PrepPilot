"""FastAPI dependencies for database, auth, and authorization."""

from typing import AsyncGenerator, Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.database.session import async_session_maker
from app.models.user import User

security = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session for request scope."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def _get_user_from_token(
    credentials: HTTPAuthorizationCredentials | None,
    db: AsyncSession,
) -> User:
    """Decode JWT and load the active user."""
    if credentials is None or not credentials.credentials:
        raise UnauthorizedError("Missing authentication token")

    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise UnauthorizedError("Invalid token payload")
    except JWTError as exc:
        raise UnauthorizedError("Could not validate credentials") from exc

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise UnauthorizedError("User not found")
    if not user.is_active or user.is_banned:
        raise ForbiddenError("Account is inactive or banned")
    return user


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Require a valid JWT and return the authenticated user."""
    return await _get_user_from_token(credentials, db)


async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require the current user to have admin role."""
    if current_user.role != "admin":
        raise ForbiddenError("Admin access required")
    return current_user
