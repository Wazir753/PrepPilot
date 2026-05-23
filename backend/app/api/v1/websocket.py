"""WebSocket routes for real-time interview sessions."""

import json
import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import jwt, JWTError

from app.core.config import settings
from app.ml.answer_evaluator import AnswerEvaluator

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])

_evaluator = AnswerEvaluator()


class ConnectionManager:
    """Manage active WebSocket connections per interview."""

    def __init__(self) -> None:
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, interview_id: str, websocket: WebSocket) -> None:
        """Accept and register a WebSocket connection."""
        await websocket.accept()
        if interview_id not in self.active:
            self.active[interview_id] = []
        self.active[interview_id].append(websocket)

    def disconnect(self, interview_id: str, websocket: WebSocket) -> None:
        """Remove a WebSocket from active connections."""
        if interview_id in self.active:
            self.active[interview_id] = [
                ws for ws in self.active[interview_id] if ws != websocket
            ]

    async def broadcast(self, interview_id: str, message: dict) -> None:
        """Send message to all connections for an interview."""
        for ws in self.active.get(interview_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                logger.exception("Failed to send WS message")


manager = ConnectionManager()


def _verify_ws_token(token: str) -> str | None:
    """Validate JWT and return user_id."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


@router.websocket("/ws/interview/{interview_id}")
async def interview_websocket(
    websocket: WebSocket,
    interview_id: UUID,
    token: Annotated[str, Query(...)],
):
    """
    Real-time interview WebSocket.

    Message types: ping, answer, evaluate
    """
    user_id = _verify_ws_token(token)
    if not user_id:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    room = str(interview_id)
    await manager.connect(room, websocket)

    await websocket.send_json(
        {
            "type": "connected",
            "interview_id": room,
            "user_id": user_id,
        }
    )

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            msg_type = data.get("type", "unknown")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif msg_type == "evaluate":
                result = _evaluator.evaluate(
                    question_text=data.get("question_text", ""),
                    answer_text=data.get("answer_text", ""),
                    expected_keywords=data.get("expected_keywords"),
                )
                await websocket.send_json({"type": "evaluation", "data": result})
                await manager.broadcast(room, {"type": "evaluation", "data": result})

            elif msg_type == "answer":
                await manager.broadcast(
                    room,
                    {
                        "type": "answer_received",
                        "question_number": data.get("question_number"),
                    },
                )

            else:
                await websocket.send_json(
                    {"type": "error", "message": f"Unknown type: {msg_type}"}
                )

    except WebSocketDisconnect:
        manager.disconnect(room, websocket)
        logger.info("WebSocket disconnected for interview %s", room)
