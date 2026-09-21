#!/bin/bash
set -e

echo "Starting Celery Worker in background..."
celery -A src.celery_engine.celery_app worker --loglevel=info &

echo "Starting FastAPI Chatbot Web Server on port ${PORT:-8000}..."
exec uvicorn src.chatbot.main:app --host 0.0.0.0 --port ${PORT:-8000}
