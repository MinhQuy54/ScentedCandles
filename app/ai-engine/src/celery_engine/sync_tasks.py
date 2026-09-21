import os
import logging
from sqlalchemy import create_engine, text
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
from google import genai
from .celery_app import celery_app

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/scented_candles")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION_NAME", "aurascent_products")
GEMINI_API_KEY = os.getenv("API_KEY")

engine = create_engine(DATABASE_URL)


def get_qdrant_client():
    return QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY if QDRANT_API_KEY else None)


def get_gemini_client():
    if not GEMINI_API_KEY:
        raise ValueError("Thiếu API_KEY biến môi trường!")
    return genai.Client(api_key=GEMINI_API_KEY)


@celery_app.task(name="sync_product_to_qdrant_task")
def sync_product_to_qdrant_task(product_id: str, action: str = "UPSERT"):
    logger.info(f"[Celery] Bắt đầu đồng bộ product_id={product_id}, action={action}")
    qdrant = get_qdrant_client()

    # Đảm bảo Collection tồn tại (vector size 768 = text-embedding-004)
    try:
        collections = [c.name for c in qdrant.get_collections().collections]
        if QDRANT_COLLECTION not in collections:
            qdrant.create_collection(
                collection_name=QDRANT_COLLECTION,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE),
            )
    except Exception as e:
        logger.warning(f"[Celery] Kiểm tra collection thất bại: {e}")

    # Xử lý hành động DELETE
    if action == "DELETE":
        try:
            qdrant.delete(collection_name=QDRANT_COLLECTION, points_selector=[product_id])
            logger.info(f"[Celery] Đã xóa point {product_id} khỏi Qdrant.")
            return {"status": "DELETED", "product_id": product_id}
        except Exception as e:
            logger.error(f"[Celery] Xóa point {product_id} lỗi: {e}")
            raise e

    # Đọc sản phẩm từ PostgreSQL — đúng schema thực tế (không có scent_profiles)
    with engine.connect() as conn:
        query = text("""
            SELECT
                p.id AS product_id, p.sku, p.name, p.slug,
                p.short_description, p.raw_description, p.price,
                p.compare_at_price, p.status, p.is_featured,
                p.weight_grams, p.burn_time_hours,
                c.name AS category_name,
                i.quantity_on_hand, i.quantity_reserved,
                (COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0)) AS quantity_available,
                i.low_stock_threshold,
                pi.url AS image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN inventory i ON p.id = i.product_id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
            WHERE p.id = :pid AND p.deleted_at IS NULL
        """)
        result = conn.execute(query, {"pid": product_id}).mappings().fetchone()

    if not result:
        logger.warning(f"[Celery] Không tìm thấy product_id={product_id} trong DB (hoặc đã bị xóa mềm).")
        try:
            qdrant.delete(collection_name=QDRANT_COLLECTION, points_selector=[product_id])
        except Exception:
            pass
        return {"status": "NOT_FOUND_DELETED", "product_id": product_id}

    status = str(result["status"]).upper()

    # Chỉ đồng bộ ACTIVE hoặc DRAFT — các trạng thái khác xóa khỏi Qdrant
    if status not in ("ACTIVE", "DRAFT"):
        logger.warning(f"[Celery] Sản phẩm {product_id} có status={status}. Xóa khỏi Qdrant.")
        try:
            qdrant.delete(collection_name=QDRANT_COLLECTION, points_selector=[product_id])
        except Exception:
            pass
        return {"status": "INACTIVE_DELETED", "product_id": product_id}

    # Tính toán các trường inventory
    qty_on_hand = int(result["quantity_on_hand"] or 0)
    qty_reserved = int(result["quantity_reserved"] or 0)
    qty_available = int(result["quantity_available"] or 0)
    inventory_status = "Còn hàng" if qty_available > 0 else "Hết hàng"

    # Ghép chuỗi văn bản ngữ nghĩa để sinh Embedding Vector
    text_content = f"""Tên sản phẩm: {result['name']}
SKU: {result['sku']}
Danh mục: {result['category_name'] or 'Không có'}
Mô tả ngắn: {result['short_description'] or 'Không có'}
Mô tả chi tiết: {result['raw_description'] or 'Không có'}
Giá bán: {float(result['price']):,.0f} VNĐ
Thời gian đốt: {str(result['burn_time_hours']) + ' giờ' if result['burn_time_hours'] else 'Không có'}
Khối lượng: {str(result['weight_grams']) + ' gram' if result['weight_grams'] else 'Không có'}
Trạng thái tồn kho: {inventory_status}
Số lượng có thể bán: {qty_available} sản phẩm""".strip()

    # Sinh Embedding Vector qua pipeline embedding (gemini-embedding-001, output 768 dimensions)
    try:
        from src.chatbot.pipeline.embedding import embed_text
    except ImportError:
        from ..chatbot.pipeline.embedding import embed_text

    genai_client = get_gemini_client()
    vector = embed_text(genai_client, text_content, "RETRIEVAL_DOCUMENT")

    # Build payload đầy đủ để Chatbot RAG có thể dùng
    payload = {
        "product_id": str(result["product_id"]),
        "name": result["name"],
        "price": float(result["price"]),
        "content": text_content,
        "metadata": {
            "sku": result["sku"],
            "category_name": result["category_name"],
            "quantity_on_hand": qty_on_hand,
            "quantity_available": qty_available,
            "inventory_status": inventory_status,
            "image_url": result["image_url"] or "",
            "type": "product"
        }
    }

    # Upsert Point vào Qdrant (point_id = product_id UUID)
    qdrant.upsert(
        collection_name=QDRANT_COLLECTION,
        points=[PointStruct(id=str(result["product_id"]), vector=vector, payload=payload)]
    )

    logger.info(f"[Celery] ✅ Upsert thành công product_id={product_id} | '{result['name']}' vào Qdrant!")
    return {"status": "UPSERTED", "product_id": product_id}
