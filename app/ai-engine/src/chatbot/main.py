import os
import logging
import asyncio
import threading
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv
from qdrant_client import QdrantClient
from google import genai

try:
    from pipeline.embedding import embed_text
except ImportError:
    from .pipeline.embedding import embed_text

load_dotenv(find_dotenv())

collection_name = os.getenv("QDRANT_COLLECTION_NAME", "aurascent_products")


def get_clients():
    api_key = os.getenv("API_KEY")
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if not api_key:
        raise ValueError("Chưa tìm thấy API_KEY trong biến môi trường!")
    if not qdrant_url:
        raise ValueError("Chưa tìm thấy QDRANT_URL trong biến môi trường!")
    if not qdrant_api_key:
        raise ValueError("Chưa tìm thấy QDRANT_API_KEY trong biến môi trường!")

    client = genai.Client(api_key=api_key)
    qdrant_client = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api_key,
    )
    return client, qdrant_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


async def call_api_gemini(genai_client: genai.Client, prompt: str):
    raw_models = [
        name.strip()
        for name in os.getenv(
            "GEMINI_CHAT_MODELS",
            "gemini-flash-lite-latest,gemini-flash-latest",
        ).split(",")
        if name.strip() and name.strip() not in ("gemini-3.6-flash", "gemini-2.5-flash")
    ]
    models = ["gemini-flash-lite-latest"] + [m for m in raw_models if m != "gemini-flash-lite-latest"]

    STREAM_TIMEOUT = float(os.getenv("GEMINI_STREAM_TIMEOUT", "12"))  # seconds per model

    for model in models:
        try:
            loop = asyncio.get_event_loop()

            def do_stream():
                return list(genai_client.models.generate_content_stream(
                    model=model,
                    contents=prompt,
                ))

            try:
                chunks = await asyncio.wait_for(
                    loop.run_in_executor(None, do_stream),
                    timeout=STREAM_TIMEOUT
                )
            except asyncio.TimeoutError:
                logger.warning(f"[Chatbot] Model {model} bị timeout sau {STREAM_TIMEOUT}s, chuyển sang model tiếp theo...")
                continue

            found_content = False
            for chunk in chunks:
                try:
                    text = chunk.text
                except Exception:
                    continue
                if text:
                    found_content = True
                    yield text
                    await asyncio.sleep(0.005)

            if found_content:
                return

        except Exception as e:
            logger.error(f"Lỗi model {model}: {str(e)}")
            continue

    yield "Hiện tại hệ thống AI đang quá tải. Quý khách vui lòng thử lại sau vài giây nhé!"



class ChatRequest(BaseModel):
    message: str


app = FastAPI(
    title="Aurora Scent AI Engine",
    description="AI Engine cho Aurora Scent",
    version="1.0.0", 
)

cors_allowed_origins = {
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
}

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    cors_allowed_origins.add(frontend_url.rstrip("/"))

if not cors_allowed_origins:
    cors_allowed_origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:80",
        "http://127.0.0.1:80",
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(cors_allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SyncTaskRequest(BaseModel):
    product_id: str
    action: str = "UPSERT"  # 'UPSERT' hoặc 'DELETE'


@app.post("/tasks/sync-product")
async def trigger_sync_product(req: SyncTaskRequest):
    """Trigger đồng bộ sản phẩm sang Qdrant thông qua Celery Worker"""
    logger.info(f"[Sync] Nhận trigger Celery product_id={req.product_id}, action={req.action}")
    try:
        from src.celery_engine.sync_tasks import sync_product_to_qdrant_task
        task = sync_product_to_qdrant_task.delay(product_id=req.product_id, action=req.action)
        return {
            "status": "QUEUED",
            "task_id": task.id,
            "product_id": req.product_id,
            "action": req.action
        }
    except Exception as e:
        logger.error(f"[Sync] Lỗi khi gửi task vào Celery Broker: {e}")
        raise HTTPException(status_code=500, detail=f"Không thể gửi Celery task: {str(e)}")


@app.head("/health")
@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/chat")
async def chat_with_aurascent(request: ChatRequest):
    user_query = request.message
    logger.info("Đang xử lý câu hỏi: %s", user_query)
    try:
        genai_client, qdrant_client = get_clients()
        query_vector = await asyncio.to_thread(
            embed_text,
            genai_client,
            user_query,
            "RETRIEVAL_QUERY",
        )
        chat_results = qdrant_client.query_points(
            collection_name=collection_name,
            query=query_vector,
            limit=5
        ).points
        
        context_data = ""
        for hit in chat_results:
            p = hit.payload
            if p is not None:
                m = p.get("metadata", {})
                inventory_info = f" - Tồn kho: {m.get('quantity_on_hand', 0)}" if 'quantity_on_hand' in m else ""
                if m.get("type") == "policy":
                    context_data += f"[CHÍNH SÁCH]: {p.get('content')}\n"
                else:
                    context_data += f"[SẢN PHẨM]: {p.get('content')} - Giá: {m.get('price', 'Liên hệ')} VNĐ{inventory_info}\n"
        
        prompt = f"""
            Bạn là tư vấn viên của cửa hàng nến thơm AuraScent.
            Hãy trả lời câu hỏi của khách hàng một cách tự nhiên, ngắn gọn và đúng trọng tâm dựa trên thông tin dưới đây.

            QUY TẮC BẮT BUỘC:
            1. Trả lời đi thẳng vào vấn đề. KHÔNG chào hỏi rườm rà, KHÔNG lặp lại câu chào mừng hay tự giới thiệu lại tên cửa hàng/trợ lý ở đầu mỗi câu trả lời.
            2. Trả lời bằng văn bản thuần (plain text), KHÔNG dùng định dạng markdown, KHÔNG dùng dấu *, KHÔNG dùng ký hiệu gạch đầu dòng (bullet points).
            3. Nếu không tìm thấy thông tin phù hợp, hãy thông báo lịch sự cho khách biết.

            Thông tin tham khảo:
            {context_data}

            Câu hỏi của khách: {user_query}
            Trả lời:
            """
        return StreamingResponse(
            call_api_gemini(genai_client, prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "X-Accel-Buffering": "no",
                "Pragma": "no-cache",
                "Expires": "0",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        logger.error("Lỗi: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))