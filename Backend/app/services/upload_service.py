import uuid
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
from qdrant_client.models import PointStruct, VectorParams, Distance

from app.db import get_qdrant_client
from app.config import EMBEDDING_MODEL, COLLECTION_NAME

_embed_model = SentenceTransformer(EMBEDDING_MODEL)

CHUNK_SIZE = 400          # words per chunk
CHUNK_OVERLAP = 50        # words of overlap between consecutive chunks
VECTOR_SIZE = 384         # BGE-small output dimension


# ─── Ensure Collection Exists ─────────────────────────────────────────────────

def _ensure_collection():
    client = get_qdrant_client()
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )


# ─── PDF Text Extraction ──────────────────────────────────────────────────────

def _extract_text(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text())
    doc.close()
    return "\n".join(pages)


# ─── Chunking ─────────────────────────────────────────────────────────────────

def _chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    chunks = []
    step = max(chunk_size - overlap, 1)
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks


# ─── Embed + Upsert ───────────────────────────────────────────────────────────

def _embed_and_store(chunks: list[str], filename: str) -> int:
    _ensure_collection()
    client = get_qdrant_client()

    points = []
    for chunk in chunks:
        vector = _embed_model.encode(chunk).tolist()
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={
                "text": chunk,
                "source": filename,
                "chunk_file": filename,   # keep legacy field for search_service compatibility
            },
        )
        points.append(point)

    # Upsert in batches of 64 to avoid memory spikes
    batch_size = 64
    for i in range(0, len(points), batch_size):
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points[i : i + batch_size],
        )

    return len(points)


# ─── Public Entry Point ───────────────────────────────────────────────────────

def ingest_pdf(file_bytes: bytes, filename: str) -> dict:
    """
    Full pipeline: extract → chunk → embed → store.
    Returns a summary dict.
    """
    raw_text = _extract_text(file_bytes)

    if not raw_text.strip():
        raise ValueError("PDF contains no extractable text (may be image-only).")

    chunks = _chunk_text(raw_text)

    if not chunks:
        raise ValueError("No valid text chunks produced from the PDF.")

    stored = _embed_and_store(chunks, filename)

    return {
        "filename": filename,
        "characters": len(raw_text),
        "chunks_stored": stored,
        "status": "success",
    }
