import os

from google import genai
from google.genai import types

EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
EMBEDDING_DIMENSION = int(os.getenv("GEMINI_EMBEDDING_DIMENSION", "768"))

def build_embedding_config(task_type : str) -> types.EmbedContentConfig:
    return types.EmbedContentConfig(
        task_type=task_type,
        output_dimensionality=EMBEDDING_DIMENSION,
    )

def embed_texts(client: genai.Client, texts : list[str], task_type: str) -> list[list[float]]:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
        config=build_embedding_config(task_type),
    )
    return [embedding.values for embedding in response.embeddings]


def embed_text(client: genai.Client, text: str, task_type: str) -> list[float]:
    return embed_texts(client, [text], task_type)[0]


