# PrepPilot Deployment Guide

## Docker (Recommended)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Set OPENAI_API_KEY in backend/.env

docker compose up --build -d
```

Services:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Nginx: http://localhost:80

Run migrations:

```bash
docker compose exec backend alembic upgrade head
```

## Production

Use `docker/docker-compose.prod.yml`:

```bash
docker compose -f docker/docker-compose.prod.yml up --build -d
```

Configure:
- Strong `SECRET_KEY` (32+ chars)
- Production `DATABASE_URL` and `REDIS_URL`
- `CORS_ORIGINS` for your domain
- SSL certificates in `docker/nginx/ssl/`

## Manual Deployment

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run build
# Serve build/ with nginx or static host
```

### Celery Worker

```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

## Environment

See [ENVIRONMENT.md](./ENVIRONMENT.md) for all variables.

## Health Checks

- API: `GET /health`
- Admin: `GET /api/v1/admin/system-health`
