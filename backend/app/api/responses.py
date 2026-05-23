"""Standard API response envelope helpers."""

from datetime import datetime, timezone
from typing import Any, Optional

from fastapi.responses import JSONResponse


def api_response(
    data: Any = None,
    success: bool = True,
    error: Optional[dict[str, Any]] = None,
    status_code: int = 200,
) -> JSONResponse:
    """Build a JSON response with the standard PrepPilot envelope."""
    body = {
        "success": success,
        "data": data,
        "error": error,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    return JSONResponse(content=body, status_code=status_code)


def success_response(data: Any = None, status_code: int = 200) -> JSONResponse:
    """Return a successful API response."""
    return api_response(data=data, success=True, status_code=status_code)


def error_response(
    message: str,
    error_code: str = "ERROR",
    status_code: int = 400,
    details: Any = None,
) -> JSONResponse:
    """Return an error API response."""
    error = {"code": error_code, "message": message}
    if details is not None:
        error["details"] = details
    return api_response(data=None, success=False, error=error, status_code=status_code)
