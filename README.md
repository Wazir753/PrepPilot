# PrepPilot 🚀

> **Ace Every Interview. Powered by AI.**

PrepPilot is an AI-powered Interview Simulator SaaS platform for technical, behavioral, HR, and coding interview practice. It features real-time voice and facial emotion analysis, an interactive AI interviewer, live coding environments, and comprehensive post-interview analytics.

![React](https://img.shields.io/badge/React-16-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-3.11-009688)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991)

## Features

- **Live AI Interviewer** — GPT-4o dynamic questioning that adapts to your answers
- **Real-Time Emotion & Voice Analysis** — Eye contact, stress, speaking speed, filler words
- **Live Coding Sandboxes** — Python, JavaScript, Java, C++, Go
- **Adaptive Difficulty** — Questions scale with your performance
- **Deep Analytics** — Radar charts, trends, weakness heatmaps, PDF reports
- **Interview Replay** — Timeline replay with per-answer AI feedback
- **Leaderboard** — Global rankings cached in Redis
- **Admin Panel** — User management and system health

## Architecture

```text
+-------------------+      +-------------------+      +-------------------+
|   React 16 SPA    | <--> |   Nginx Reverse   | <--> |  FastAPI Backend  |
|  (Tailwind, UI)   |      |       Proxy       |      | (Python 3.11+)    |
+--------+----------+      +-------------------+      +---------+---------+
         |                                                      |
         v                                                      v
+-------------------+                                 +-------------------+
|  WebSockets (WS)  | <-----------------------------> |   Redis (Cache)   |
+-------------------+                                 +---------+---------+
                                                                |
                                                      +---------+---------+
                                                      |  PostgreSQL 15    |
                                                      +---------+---------+
                                                                |
                                                      +---------+---------+
                                                      |  Celery Workers   |
                                                      +-------------------+
```

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (manual frontend)
- Python 3.11+ (manual backend)
- OpenAI API key

## Quick Start (Docker)

```bash
git clone https://github.com/Wazir753/PrepPilot.git
cd PrepPilot
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env — set OPENAI_API_KEY and SECRET_KEY

docker compose up --build -d
docker compose exec backend alembic upgrade head
```

- **App:** http://localhost:3000  
- **API:** http://localhost:8000  
- **API Docs:** http://localhost:8000/docs  

Alternative compose path: `docker compose -f docker/docker-compose.yml up --build -d`

## Manual Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Celery

```bash
cd backend
celery -A app.tasks.celery_app worker --loglevel=info
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL (asyncpg) | `postgresql+asyncpg://postgres:postgres@localhost:5432/preppilot` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT secret (32+ chars) | `your-super-secret-key-minimum-32-chars` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `REACT_APP_API_URL` | Frontend API base | `http://localhost:8000/api/v1` |

Full reference: [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)

## Documentation

- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Environment Variables](docs/ENVIRONMENT.md)

## Screenshots

> Add screenshots after first run: Landing, Dashboard, Live Interview, Analytics.

## Project Structure

```text
PrepPilot/
├── frontend/          # React 16 SPA
├── backend/           # FastAPI + SQLAlchemy
├── docker/            # Compose, nginx, postgres init
├── docs/              # Documentation
└── .github/workflows/ # CI/CD
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Open a pull request

## License

MIT License — see [LICENSE](LICENSE) for details.
