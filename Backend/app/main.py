from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import search, ask, upload

app = FastAPI(
    title="Research AI API",
    description="Local-first AI research assistant with RAG + semantic search",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(search.router)
app.include_router(ask.router)
app.include_router(upload.router)


# ─── Root ─────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Research AI API is running", "status": "ok"}


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "healthy"}


# ─── Document List ────────────────────────────────────────────────────────────
@app.get("/docs-list")
def list_documents():
    """Return unique filenames currently stored in Qdrant."""
    from app.db import get_qdrant_client
    from app.config import COLLECTION_NAME

    client = get_qdrant_client()
    try:
        existing = [c.name for c in client.get_collections().collections]
        if COLLECTION_NAME not in existing:
            return {"documents": []}

        # Scroll through all points and collect unique sources
        seen = set()
        offset = None
        while True:
            result, next_offset = client.scroll(
                collection_name=COLLECTION_NAME,
                limit=256,
                offset=offset,
                with_payload=True,
                with_vectors=False,
            )
            for point in result:
                src = (point.payload or {}).get("source") or (point.payload or {}).get("chunk_file") or "Unknown"
                seen.add(src)
            if next_offset is None:
                break
            offset = next_offset

        return {"documents": sorted(seen)}
    except Exception:
        return {"documents": []}