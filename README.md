# PrepPilot 🚀

> "Ace Every Interview. Powered by AI."

PrepPilot is an elite, AI-powered Interview Simulator SaaS platform designed to help candidates prepare for technical, behavioral, HR, and coding interviews. It features real-time voice and facial emotion analysis, an interactive AI interviewer, live coding environments, and comprehensive post-interview feedback.

## 🌟 Features
- **Live AI Interviewer**: GPT-4o powered dynamic questioning adapting to your responses.
- **Real-Time Emotion & Voice Analysis**: Evaluates eye contact, stress levels, speaking speed, and filler words using DeepFace, MediaPipe, and librosa.
- **Live Coding Sandboxes**: Fully functional code execution environment for Python, JavaScript, Java, C++, and Go.
- **Adaptive Difficulty**: AI dynamically adjusts question difficulty based on your performance.
- **Deep Analytics**: Detailed score breakdowns, skill radar charts, and weakness heatmaps.
- **Interview Replay**: Re-watch your interview with synchronized AI feedback.
- **PDF Performance Reports**: Downloadable, comprehensive interview summaries.

## 🏗 Architecture

```text
+-------------------+      +-------------------+      +-------------------+
|                   |      |                   |      |                   |
|   React 16 SPA    | <--> |   Nginx Reverse   | <--> |  FastAPI Backend  |
|  (Tailwind, UI)   |      |       Proxy       |      | (Python 3.11+)    |
|                   |      |                   |      |                   |
+--------+----------+      +-------------------+      +---------+---------+
         |                                                      |
         v                                                      v
+-------------------+                                 +-------------------+
|                   |                                 |                   |
|  WebSockets (WS)  | <-----------------------------> |   Redis (Cache)   |
|                   |                                 |                   |
+-------------------+                                 +---------+---------+
                                                                |
                                                      +---------+---------+
                                                      |                   |
                                                      |  PostgreSQL 15    |
                                                      |                   |
                                                      +---------+---------+
                                                                |
                                                      +---------+---------+
                                                      |                   |
                                                      |  Celery Workers   |
                                                      |                   |
                                                      +-------------------+
```

## 🛠 Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for manual frontend setup)
- Python 3.11+ (for manual backend setup)

## 🚀 Quick Start (Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/preppilot.git
   cd preppilot
   ```
2. Copy the environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Start the application:
   ```bash
   docker-compose up --build -d
   ```
   *The app will be available at http://localhost:3000*

## 💻 Manual Setup

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@postgres:5432/preppilot` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `SECRET_KEY` | JWT Secret Key | `super-secret-key-min-32-chars` |
| `OPENAI_API_KEY` | OpenAI API Key for GPT-4o & Whisper | `sk-...` |

## 📚 Documentation
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Details](docs/ARCHITECTURE.md)

## 📄 License
This project is licensed under the MIT License.
