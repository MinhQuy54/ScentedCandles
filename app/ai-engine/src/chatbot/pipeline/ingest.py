import os
import json
import logging
from pathlib import Path

from dotenv import load_dotenv, find_dotenv
from google import genai
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

load_dotenv(find_dotenv())

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

API_KEY             = os.getenv("API_KEY")
QDRANT_URL          = os.getenv("QDRANT_URL")
QDRANT_API_KEY      = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME     = os.getenv("QDRANT_COLLECTION_NAME", "aurascent_products")
try:
    from embedding import EMBEDDING_DIMENSION, embed_texts
except ImportError:
    from .embedding import EMBEDDING_DIMENSION, embed_texts

JSON_FILE = Path(__file__).parent.parent / "data" / "products_for_rag.jsonl"

if not API_KEY:
    raise ValueError("API_KEY is not set")
if not QDRANT_URL:
    raise ValueError("QDRANT_URL is not set")
if not QDRANT_API_KEY:
    raise ValueError("QDRANT_API_KEY is not set")

genai_client  = genai.Client(api_key=API_KEY)
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)


def ingest_data():
    if not JSON_FILE.exists():
        logger.error(f"Không tìm thấy file: {JSON_FILE}")
        logger.error("Hãy chạy extract.py trước để tạo file dữ liệu.")
        return

    documents = []
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                documents.append(json.loads(line))

    if not documents:
        logger.error("File JSONL rỗng, không có dữ liệu để ingest.")
        return

    logger.info(f"Đọc được {len(documents)} sản phẩm từ {JSON_FILE}")

    if qdrant_client.collection_exists(COLLECTION_NAME):
        logger.info(f"Xoá collection cũ: {COLLECTION_NAME}")
        qdrant_client.delete_collection(COLLECTION_NAME)

    logger.info(f"Tạo collection mới: {COLLECTION_NAME} (dim={EMBEDDING_DIMENSION})")
    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=EMBEDDING_DIMENSION, distance=Distance.COSINE),
    )

    logger.info("Bắt đầu tạo embedding...")
    texts = [doc["content"] for doc in documents] 
    embeddings = embed_texts(genai_client, texts, "RETRIEVAL_DOCUMENT")
    points = [
        PointStruct(
            id=i,
            vector=vector,
            payload={
                "doc_id":   doc["doc_id"],
                "content":  doc["content"],
                "metadata": doc["metadata"],
            },
        )
        for i, (doc, vector) in enumerate(zip(documents, embeddings))
    ]

    qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
    logger.info(f"Đã nạp thành công {len(points)} sản phẩm vào Qdrant collection '{COLLECTION_NAME}'!")


if __name__ == "__main__":
    ingest_data()