# Environment Variables

## Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `postgresql+asyncpg://user:pass@host:5432/preppilot` |
| `REDIS_URL` | Yes | `redis://host:6379/0` |
| `SECRET_KEY` | Yes | JWT secret (min 32 chars) |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_MODEL` | No | Default `gpt-4o` |
| `WHISPER_MODEL` | No | Default `whisper-1` |
| `CORS_ORIGINS` | No | JSON array of allowed origins |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | Default `7` |
| `MAX_AUDIO_FILE_SIZE_MB` | No | Default `25` |
| `CODE_EXECUTION_TIMEOUT` | No | Default `10` |
| `ENVIRONMENT` | No | `development` or `production` |

## Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | API base, e.g. `http://localhost:8000/api/v1` |
| `REACT_APP_WS_URL` | WebSocket base, e.g. `ws://localhost:8000` |
| `REACT_APP_APP_NAME` | Display name |
| `REACT_APP_VERSION` | App version string |

## Docker Compose

Services read `backend/.env` via `env_file`. Frontend build args can set `REACT_APP_*` at build time.
