"""Coding challenge API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.responses import success_response, error_response
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.coding_service import coding_service
from app.schemas.coding import CodeExecuteRequest, CodeEvaluateRequest, CodingSubmissionOut
from app.core.exceptions import PrepPilotException

router = APIRouter(prefix="/coding", tags=["coding"])


@router.post("/execute")
async def execute_code(
    body: CodeExecuteRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Execute code in sandbox."""
    try:
        submission = await coding_service.execute_code(
            db=db,
            user=user,
            source_code=body.source_code,
            language=body.language,
            stdin=body.stdin or "",
            problem_title=body.problem_title,
            interview_id=body.interview_id,
        )
        return success_response(
            CodingSubmissionOut.model_validate(submission).model_dump(mode="json"),
            status_code=201,
        )
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)


@router.post("/{submission_id}/evaluate")
async def evaluate_code(
    submission_id: UUID,
    body: CodeEvaluateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """AI-evaluate a code submission."""
    try:
        submission = await coding_service.evaluate_with_ai(
            db, submission_id, user.id, body.problem_description
        )
        return success_response(
            CodingSubmissionOut.model_validate(submission).model_dump(mode="json")
        )
    except PrepPilotException as exc:
        return error_response(exc.message, exc.error_code, exc.status_code, exc.details)
