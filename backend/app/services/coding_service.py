"""Code execution sandbox and submission management."""

import asyncio
import subprocess
import tempfile
import time
from pathlib import Path
from uuid import UUID
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ValidationError, NotFoundError
from app.models.coding_submission import CodingSubmission
from app.models.user import User
from app.services.ai_service import ai_service

LANGUAGE_CONFIG: dict[str, dict[str, str]] = {
    "python": {"ext": ".py", "cmd": ["python", "{file}"]},
    "javascript": {"ext": ".js", "cmd": ["node", "{file}"]},
    "java": {"ext": ".java", "cmd": ["java", "{file}"]},
    "cpp": {"ext": ".cpp", "cmd": ["g++", "{file}", "-o", "/tmp/out", "&&", "/tmp/out"]},
}


class CodingService:
    """Execute code in subprocess sandbox with timeout."""

    @staticmethod
    def _run_python(file_path: str, stdin: str, timeout: int) -> dict[str, Any]:
        """Execute Python file with timeout."""
        start = time.perf_counter()
        try:
            proc = subprocess.run(
                ["python", file_path],
                input=stdin.encode() if stdin else None,
                capture_output=True,
                timeout=timeout,
                text=False,
            )
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            return {
                "stdout": proc.stdout.decode(errors="replace"),
                "stderr": proc.stderr.decode(errors="replace"),
                "exit_code": proc.returncode,
                "execution_time_ms": elapsed_ms,
                "status": "success" if proc.returncode == 0 else "error",
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Execution timed out",
                "exit_code": -1,
                "execution_time_ms": timeout * 1000,
                "status": "timeout",
            }

    @staticmethod
    def _run_javascript(file_path: str, stdin: str, timeout: int) -> dict[str, Any]:
        """Execute JavaScript file with timeout."""
        start = time.perf_counter()
        try:
            proc = subprocess.run(
                ["node", file_path],
                input=stdin.encode() if stdin else None,
                capture_output=True,
                timeout=timeout,
                text=False,
            )
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            return {
                "stdout": proc.stdout.decode(errors="replace"),
                "stderr": proc.stderr.decode(errors="replace"),
                "exit_code": proc.returncode,
                "execution_time_ms": elapsed_ms,
                "status": "success" if proc.returncode == 0 else "error",
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Execution timed out",
                "exit_code": -1,
                "execution_time_ms": timeout * 1000,
                "status": "timeout",
            }

    async def execute_code(
        self,
        db: AsyncSession,
        user: User,
        source_code: str,
        language: str,
        stdin: str = "",
        problem_title: str = "Untitled",
        interview_id: Optional[UUID] = None,
    ) -> CodingSubmission:
        """Run code in sandbox and persist submission."""
        if language not in LANGUAGE_CONFIG:
            raise ValidationError(f"Unsupported language: {language}")

        config = LANGUAGE_CONFIG[language]
        timeout = settings.CODE_EXECUTION_TIMEOUT

        submission = CodingSubmission(
            user_id=user.id,
            interview_id=interview_id,
            problem_title=problem_title,
            language=language,
            source_code=source_code,
            stdin=stdin,
            status="running",
        )
        db.add(submission)
        await db.flush()

        ext = config["ext"]
        with tempfile.NamedTemporaryFile(mode="w", suffix=ext, delete=False) as tmp:
            tmp.write(source_code)
            file_path = tmp.name

        loop = asyncio.get_event_loop()
        if language == "python":
            result = await loop.run_in_executor(
                None, self._run_python, file_path, stdin, timeout
            )
        elif language == "javascript":
            result = await loop.run_in_executor(
                None, self._run_javascript, file_path, stdin, timeout
            )
        else:
            result = {
                "stdout": "",
                "stderr": f"Execution for {language} not fully configured in sandbox",
                "exit_code": 1,
                "execution_time_ms": 0,
                "status": "error",
            }

        Path(file_path).unlink(missing_ok=True)

        submission.stdout = result["stdout"]
        submission.stderr = result["stderr"]
        submission.exit_code = result["exit_code"]
        submission.execution_time_ms = result["execution_time_ms"]
        submission.status = result["status"]
        await db.flush()
        await db.refresh(submission)
        return submission

    async def evaluate_with_ai(
        self,
        db: AsyncSession,
        submission_id: UUID,
        user_id: UUID,
        problem_description: str,
    ) -> CodingSubmission:
        """Run AI code evaluation on a submission."""
        result = await db.execute(
            select(CodingSubmission).where(
                CodingSubmission.id == submission_id,
                CodingSubmission.user_id == user_id,
            )
        )
        submission = result.scalar_one_or_none()
        if not submission:
            raise NotFoundError("Submission not found")

        test_summary = f"exit_code={submission.exit_code}, stdout={submission.stdout[:500] if submission.stdout else ''}"
        evaluation = await ai_service.evaluate_code(
            problem_description=problem_description,
            language=submission.language,
            source_code=submission.source_code,
            test_results=test_summary,
        )
        submission.ai_evaluation = evaluation
        submission.score = evaluation.get("score")
        await db.flush()
        await db.refresh(submission)
        return submission


coding_service = CodingService()
