# PrepPilot Architecture

## Overview

PrepPilot is a full-stack SaaS interview simulator with:
- **React 16 SPA** — dark-themed UI, real-time interview room
- **FastAPI backend** — async SQLAlchemy, JWT auth, WebSockets
- **PostgreSQL** — persistent data
- **Redis** — sessions, rate limiting, leaderboard cache, Celery broker
- **OpenAI** — GPT-4o questions/evaluation, Whisper STT
- **ML pipeline** — emotion (DeepFace/MediaPipe), voice (librosa), filler detection

## Request Flow

```
Browser → Nginx → React (static) / FastAPI (/api/v1)
                    ↓
              PostgreSQL + Redis
                    ↓
              Celery (async tasks)
                    ↓
              OpenAI / ML services
```

## Core Modules

| Layer | Responsibility |
|-------|----------------|
| `api/v1/*` | HTTP routes, validation |
| `services/*` | Business logic |
| `ml/*` | Emotion, voice, scoring |
| `models/*` | SQLAlchemy ORM |
| `tasks/*` | Background jobs |

## Interview Lifecycle

1. User creates interview (`POST /interviews`)
2. First question generated (`POST /questions/{id}/next`)
3. User submits answer (`POST /responses/interview/{id}`)
4. AI evaluates (`POST /responses/{id}/evaluate`)
5. Adaptive next question (difficulty adjusts on score)
6. Complete interview (`POST /interviews/{id}/complete`)
7. Analytics + PDF report available

## Security

- JWT access (30 min) + refresh (7 days) in Redis
- bcrypt password hashing
- Rate limiting middleware
- Sandboxed code execution (subprocess, timeout, no network)

## Real-Time

WebSocket at `/api/v1/ws/interview/{id}` pushes:
- New questions
- Feedback updates
- Emotion/voice metrics
