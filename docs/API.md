# PrepPilot API Documentation

Base URL: `http://localhost:8000/api/v1`

All endpoints return a standard envelope:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2026-05-23T12:00:00+00:00"
}
```

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT pair |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/auth/me` | Current user profile |
| PUT | `/auth/profile` | Update profile |
| POST | `/auth/change-password` | Change password |

## Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/interviews` | Create interview session |
| GET | `/interviews` | List user interviews |
| GET | `/interviews/{id}` | Get interview details |
| POST | `/interviews/{id}/complete` | End interview |
| GET | `/interviews/leaderboard/global` | Global leaderboard |

## Questions & Responses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/questions/{id}/next` | Generate next question |
| POST | `/responses/interview/{id}` | Submit answer |
| GET | `/responses/interview/{id}` | List answers |
| POST | `/responses/{id}/evaluate` | AI evaluate answer |

## Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | User analytics summary |
| GET | `/analytics/trends` | Score trends |
| GET | `/analytics/skills` | Skill radar data |
| GET | `/analytics/weaknesses` | Weakness heatmap |
| POST | `/analytics/roadmap` | AI improvement roadmap |
| GET | `/analytics/report/{id}/pdf` | Download PDF report |

## Coding, Speech, Emotion

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/coding/problem/{id}` | Get coding problem |
| POST | `/coding/run` | Run code sandbox |
| POST | `/coding/submit` | Submit solution |
| POST | `/speech/transcribe` | Whisper transcription |
| POST | `/emotion/analyze` | Facial emotion analysis |

## WebSocket

`WS /api/v1/ws/interview/{interview_id}`

Events: `interview:question`, `interview:feedback`, `emotion:update`, `voice:metrics`

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List users |
| GET | `/admin/stats` | Platform KPIs |
| GET | `/admin/system-health` | Service health |

Interactive docs: `http://localhost:8000/docs`
