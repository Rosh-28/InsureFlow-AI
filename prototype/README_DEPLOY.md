# Deploying InsureFlow-AI with Docker Compose

This guide shows how to build and run the prototype locally using Docker Compose.

Prerequisites
- Docker & Docker Compose installed

1. Build and start services

```bash
cd prototype
docker-compose up --build
```

2. Open the app
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- TTS service: http://localhost:5001/health

Environment variables
- Put your Gemini API key in `prototype/server/.env` as `GEMINI_API_KEY`

Notes
- The nginx config proxies `/api` to the backend with host `server:5000` inside the Docker network.
- For production deploy, do not store secrets in `.env` in the repo; use your cloud provider's secret manager.
