from sentence_transformers import SentenceTransformer
from Backend.app.db import get_qdrant_client

model = SentenceTransformer("BAAI/bge-small-en-v1.5")


def search_papers(query):

    vector = model.encode(query).tolist()

    results = get_qdrant_client().query_points(
        collection_name="research_papers",
        query=vector,
        limit=5
    )

    papers = []

    for r in results.points:
        papers.append({
            "chunk": r.payload["chunk_file"],
            "text": r.payload["text"][:200],
            "score": r.score
        })

    return papers