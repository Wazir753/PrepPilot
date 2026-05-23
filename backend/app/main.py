"""PrepPilot FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.middleware import RequestLoggingMiddleware
from app.core.exceptions import PrepPilotException
from app.database.redis import close_redis, get_redis
from app.api.router import api_router
from app.api.responses import success_response, error_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("Starting %s v%s [%s]", settings.PROJECT_NAME, settings.VERSION, settings.ENVIRONMENT)
    try:
        redis = await get_redis()
        await redis.ping()
        logger.info("Redis connection established")
    except Exception as exc:
        logger.warning("Redis unavailable at startup: %s", exc)

    yield

    await close_redis()
    logger.info("Application shutdown complete")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="PrepPilot AI Interview Simulator API",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    @app.exception_handler(PrepPilotException)
    async def preppilot_exception_handler(request: Request, exc: PrepPilotException):
        """Handle custom application exceptions."""
        return error_response(
            message=exc.message,
            error_code=exc.error_code,
            status_code=exc.status_code,
            details=exc.details,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        """Handle HTTP exceptions with standard envelope."""
        return error_response(
            message=str(exc.detail),
            error_code="HTTP_ERROR",
            status_code=exc.status_code,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle Pydantic validation errors."""
        return error_response(
            message="Request validation failed",
            error_code="VALIDATION_ERROR",
            status_code=422,
            details=exc.errors(),
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions."""
        logger.exception("Unhandled exception: %s", exc)
        return error_response(
            message="Internal server error",
            error_code="INTERNAL_ERROR",
            status_code=500,
        )

    app.include_router(api_router)

    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return success_response(
            {"status": "ok", "environment": settings.ENVIRONMENT, "version": settings.VERSION}
        )

    return app


app = create_app()
