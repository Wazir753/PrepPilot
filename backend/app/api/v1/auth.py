"""Authentication API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.auth_service import AuthService
from app.schemas.auth import UserCreate, UserResponse, Token
from app.core.exceptions import PrepPilotException

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    """Login credentials."""

    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Refresh token payload."""

    refresh_token: str


@router.post("/register")
async def register(
    user_in: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new user account."""
    try:
        user = await AuthService.register(db, user_in)
        return success_response(user.model_dump(mode="json"), status_code=201)
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.post("/login")
async def login(
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Authenticate and receive JWT tokens."""
    try:
        tokens = await AuthService.login(db, body.email, body.password)
        return success_response(tokens.model_dump())
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.post("/refresh")
async def refresh(
    body: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Refresh access token using refresh token."""
    try:
        tokens = await AuthService.refresh_access_token(db, body.refresh_token)
        return success_response(tokens.model_dump())
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.post("/logout")
async def logout(current_user: Annotated[User, Depends(get_current_user)]):
    """Revoke refresh token."""
    await AuthService.logout(current_user.id)
    return success_response({"message": "Logged out successfully"})


@router.get("/me")
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    """Get current user profile."""
    return success_response(UserResponse.model_validate(current_user).model_dump(mode="json"))
