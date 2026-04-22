import json
import ollama
from sentence_transformers import SentenceTransformer
from app.db import get_qdrant_client
from app.config import EMBEDDING_MODEL, OLLAMA_MODEL, COLLECTION_NAME, RAG_TOP_K

_embed_model = SentenceTransformer(EMBEDDING_MODEL)

# ─── Casual Query Classifier ─────────────────────────────────────────────────

CASUAL_KEYWORDS = {
    "hi", "hello", "hey", "howdy", "sup", "how are you", "what's up",
    "whats up", "good morning", "good evening", "good night", "bye",
    "thanks", "thank you", "who are you", "what are you", "help"
}


def _is_casual(question: str) -> bool:
    q = question.strip().lower().rstrip("!?.,'\"")
    if q in CASUAL_KEYWORDS:
        return True
    if len(q.split()) <= 4:
        return any(kw in q for kw in CASUAL_KEYWORDS)
    return False


# ─── Retrieve Context from Qdrant ────────────────────────────────────────────

def _retrieve(question: str) -> tuple[str, list[dict]]:
    vector = _embed_model.encode(question).tolist()
    results = get_qdrant_client().query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=RAG_TOP_K,
        with_payload=True,
    )

    sources = []
    context_parts = []
    for r in results.points:
        payload = r.payload or {}
        text = payload.get("text", "")
        source = (
            payload.get("source")
            or payload.get("chunk_file")
            or payload.get("filename")
            or "Unknown"
        )
        context_parts.append(text)
        sources.append({
            "source": source,
            "snippet": text[:300],
            "score": round(r.score, 4),
        })

    return "\n\n---\n\n".join(context_parts), sources


# ─── SSE Helper ──────────────────────────────────────────────────────────────

def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


# ─── Streaming Generator ─────────────────────────────────────────────────────

def stream_answer(question: str):
    """
    Yields SSE-formatted strings:
      event: token   data: {"token": "..."}
      event: sources data: {"sources": [...], "query_type": "..."}
      event: done    data: {"done": true}
      event: error   data: {"message": "..."}
    """
    try:
        is_casual = _is_casual(question)

        if is_casual:
            system_msg = (
                "You are a friendly AI research assistant. "
                "Reply in 1-2 short, warm sentences only. No lists."
            )
            messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": question},
            ]
            sources = []
            query_type = "casual"
        else:
            context, sources = _retrieve(question)

            if not context.strip():
                yield _sse("token", {"token": "I don't know based on the given documents."})
                yield _sse("sources", {"sources": [], "query_type": "research"})
                yield _sse("done", {"done": True})
                return

            prompt = f"""You are a strict research assistant.

Answer ONLY using the provided context below.
If the answer is not clearly in the context, reply with:
"I don't know based on the given documents."

Do NOT guess, hallucinate, or add external facts.
Be concise — maximum 4 sentences.

Context:
{context}

Question:
{question}

Answer:"""
            messages = [{"role": "user", "content": prompt}]
            query_type = "research"

        # Stream tokens from Ollama
        stream = ollama.chat(
            model=OLLAMA_MODEL,
            messages=messages,
            stream=True,
            options={
                "temperature": 0.1 if not is_casual else 0.5,
                "num_predict": 60 if is_casual else 300,
            },
        )

        for chunk in stream:
            token = chunk.get("message", {}).get("content", "")
            if token:
                yield _sse("token", {"token": token})

        yield _sse("sources", {"sources": sources, "query_type": query_type})
        yield _sse("done", {"done": True})

    except Exception as e:
        yield _sse("error", {"message": str(e)})
        yield _sse("done", {"done": True})


# ─── Non-streaming (kept for /ask) ──────────────────────────────────────────

def ask_question(question: str) -> dict:
    is_casual = _is_casual(question)

    if is_casual:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a friendly AI research assistant. "
                        "Reply in 1-2 short, warm sentences only. No lists."
                    ),
                },
                {"role": "user", "content": question},
            ],
            options={"temperature": 0.5, "num_predict": 60},
        )
        return {
            "answer": response["message"]["content"],
            "sources": [],
            "query_type": "casual",
        }

    context, sources = _retrieve(question)

    if not context.strip():
        return {
            "answer": "I don't know based on the given documents.",
            "sources": [],
            "query_type": "research",
        }

    prompt = f"""You are a strict research assistant.

Answer ONLY using the provided context below.
If the answer is not clearly in the context, reply with:
"I don't know based on the given documents."

Do NOT guess, hallucinate, or add external facts.
Be concise — maximum 4 sentences.

Context:
{context}

Question:
{question}

Answer:"""

    response = ollama.chat(
        model=OLLAMA_MODEL,
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.1, "num_predict": 300},
    )

    return {
        "answer": response["message"]["content"],
        "sources": sources,
        "query_type": "research",
    }