from sentence_transformers import SentenceTransformer
from app.db import get_qdrant_client
from app.config import EMBEDDING_MODEL, COLLECTION_NAME

_embed_model = SentenceTransformer(EMBEDDING_MODEL)


def search_papers(query: str, limit: int = 5) -> list[dict]:
    vector = _embed_model.encode(query).tolist()

    results = get_qdrant_client().query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=limit,
        with_payload=True,
    )

    papers = []
    for r in results.points:
        payload = r.payload or {}
        papers.append({
            "source": payload.get("chunk_file") or payload.get("source") or payload.get("filename") or "Unknown",
            "snippet": payload.get("text", "")[:300],
            "score": round(r.score, 4),
        })

    return papers