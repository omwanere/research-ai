from qdrant_client import QdrantClient
from app.config import QDRANT_PATH

_client = None


def get_qdrant_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(path=QDRANT_PATH)
    return _client
