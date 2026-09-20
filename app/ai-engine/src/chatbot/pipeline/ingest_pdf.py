import os
from pathlib import Path

import pdfplumber
from dotenv import load_dotenv, find_dotenv
from google import genai
from qdrant_client import QdrantClient
from qdrant_client.http import models
from langchain_text_splitters import RecursiveCharacterTextSplitter

try:
    from embedding import embed_texts
except ImportError:
    from .embedding import embed_texts

load_dotenv(find_dotenv())

PDF_PATH = Path(__file__).parent.parent / "data" / "aurascent_info.pdf"
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "aurascent_products")
API_KEY = os.getenv("API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not API_KEY:
    raise ValueError("Không tìm thấy API_KEY")
if not QDRANT_URL:
    raise ValueError("Không tìm thấy QDRANT_URL")
if not QDRANT_API_KEY:
    raise ValueError("Không tìm thấy QDRANT_API_KEY")

genai_client = genai.Client(api_key=API_KEY)
client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

def ingest_policy():
    print(f"---Bắt đầu xử lý file {PDF_PATH}---")

    full_text = ""

    with pdfplumber.open(PDF_PATH) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"

    # chunk_size=500 ký tự, overlap=50 để không mất ngữ cảnh giữa các đoạn
    text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", ".", " ", ""]
        )
    chunks = text_splitter.split_text(full_text)
    print(f"Đã chia thành {len(chunks)} đoạn nhỏ.")

    points = []  
    embeddings = embed_texts(genai_client, chunks, "RETRIEVAL_DOCUMENT")

    for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
        points.append(models.PointStruct(
            id= i + 1000,
            vector=vector,
            payload={
                "content": chunk,
                "metadata": {
                    "type": "policy",
                    "source": os.path.basename(PDF_PATH)
                }
            }
        ))

    client.upsert(collection_name=COLLECTION_NAME, points=points)
    print("--- Hoàn thành nạp dữ liệu Policy vào Qdrant! ---")

if __name__ == "__main__":
    ingest_policy()
