"""Custom application exceptions and HTTP error mapping."""

from typing import Any, Optional


class PrepPilotException(Exception):
    """Base exception for PrepPilot application errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: Optional[str] = None,
        details: Optional[Any] = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "APP_ERROR"
        self.details = details
        super().__init__(message)


class NotFoundError(PrepPilotException):
    """Resource not found."""

    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None) -> None:
        super().__init__(message, status_code=404, error_code="NOT_FOUND", details=details)


class UnauthorizedError(PrepPilotException):
    """Authentication required or invalid credentials."""

    def __init__(self, message: str = "Unauthorized", details: Optional[Any] = None) -> None:
        super().__init__(message, status_code=401, error_code="UNAUTHORIZED", details=details)


class ForbiddenError(PrepPilotException):
    """Insufficient permissions."""

    def __init__(self, message: str = "Forbidden", details: Optional[Any] = None) -> None:
        super().__init__(message, status_code=403, error_code="FORBIDDEN", details=details)


class ConflictError(PrepPilotException):
    """Resource conflict (e.g. duplicate email)."""

    def __init__(self, message: str = "Conflict", details: Optional[Any] = None) -> None:
        super().__init__(message, status_code=409, error_code="CONFLICT", details=details)


class ValidationError(PrepPilotException):
    """Request validation failed."""

    def __init__(self, message: str = "Validation error", details: Optional[Any] = None) -> None:
        super().__init__(message, status_code=422, error_code="VALIDATION_ERROR", details=details)


class ServiceUnavailableError(PrepPilotException):
    """External service or dependency unavailable."""

    def __init__(
        self, message: str = "Service temporarily unavailable", details: Optional[Any] = None
    ) -> None:
        super().__init__(message, status_code=503, error_code="SERVICE_UNAVAILABLE", details=details)
