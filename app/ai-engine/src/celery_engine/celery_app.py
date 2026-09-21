import os
from celery import Celery
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    'scented-candles-ai-engine',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["src.celery_engine.sync_tasks"]
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=["json"],
    result_serializer='json',
    timezone='Asia/Ho_Chi_Minh',
    enable_utc=True,
)