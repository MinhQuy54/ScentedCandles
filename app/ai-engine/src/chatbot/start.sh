#!/bin/bash
set -e

echo "Starting Celery Worker with minimal memory footprint (concurrency=1)..."
celery -A src.celery_engine.celery_app worker --loglevel=info --concurrency=1 &

echo "Starting FastAPI Chatbot Web Server on port ${PORT:-8000}..."
exec uvicorn src.chatbot.main:app --host 0.0.0.0 --port ${PORT:-8000}
