"""Main API router aggregating all v1 endpoints."""

from fastapi import APIRouter

from app.api.v1 import (
    auth,
    interviews,
    questions,
    responses,
    analytics,
    coding,
    speech,
    emotion,
    voice,
    admin,
    websocket,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(interviews.router)
api_router.include_router(questions.router)
api_router.include_router(responses.router)
api_router.include_router(analytics.router)
api_router.include_router(coding.router)
api_router.include_router(speech.router)
api_router.include_router(emotion.router)
api_router.include_router(voice.router)
api_router.include_router(admin.router)
api_router.include_router(websocket.router)
