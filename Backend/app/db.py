from qdrant_client import QdrantClient

_client = None

def get_qdrant_client():
    global _client
    if _client is None:
        _client = QdrantClient(path="Data/vector_db")
    return _client
