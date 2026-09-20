import os
import logging
import asyncio
from fastapi import FastAPI, HTTPException
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

api_key = os.getenv("API_KEY")
qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")
collection_name = os.getenv("QDRANT_COLLECTION_NAME", "aurascent_products")

if not api_key:
    raise ValueError("Chưa tìm thấy API_KEY trong file .env!")
if not qdrant_url:
    raise ValueError("Chưa tìm thấy QDRANT_URL trong file .env!")
if not qdrant_api_key:
    raise ValueError("Chưa tìm thấy QDRANT_API_KEY trong file .env!")

client = genai.Client(api_key=api_key)
qdrant_client = QdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


async def call_api_gemini(prompt: str):
    models = [
        name.strip()
        for name in os.getenv(
            "GEMINI_CHAT_MODELS",
            "gemini-3.6-flash,gemini-2.5-flash",
        ).split(",")
        if name.strip()
    ]
    
    for model in models:
        try:
            response = client.models.generate_content_stream(
                model=model,
                contents=prompt,
            )
            found_content = False
            for chunk in response:
                try:
                    text = chunk.text
                except Exception:
                    continue
                if text:
                    found_content = True
                    yield text
                    await asyncio.sleep(0.01)
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


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/chat")
async def chat_with_aurascent(request: ChatRequest):
    user_query = request.message
    logger.info("Đang xử lý câu hỏi: %s", user_query)
    try:
        query_vector = await asyncio.to_thread(
            embed_text,
            client,
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
            Bạn là một nhân viên tư vấn bán hàng thân thiện của cửa hàng nến thơm Aurascent.
            Dựa vào thông tin sản phẩm dưới đây, hãy trả lời câu hỏi của khách hàng một cách tự nhiên.
            Nếu không có sản phẩm phù hợp, hãy lịch sự báo cho khách biết.
            Trả lời bằng văn bản thuần, không dùng markdown, không dùng dấu * và không dùng ký hiệu bullet.
            Thông tin sản phẩm đang có:
            {context_data}

            Câu hỏi của khách: {user_query}
            Trả lời:
            """
        return StreamingResponse(
            call_api_gemini(prompt),
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