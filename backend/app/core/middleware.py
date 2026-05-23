"""Custom middleware for request logging and response timing."""

import time
import logging
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log incoming requests and response latency."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request, measure duration, and log outcome."""
        start = time.perf_counter()
        client_host = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path

        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        logger.info(
            "%s %s %s -> %s (%.2fms)",
            client_host,
            method,
            path,
            response.status_code,
            duration_ms,
        )
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
        return response
