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


# ─── Casual Reply ─────────────────────────────────────────────────────────────

def _casual_reply(question: str) -> dict:
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


# ─── RAG Reply ────────────────────────────────────────────────────────────────

def _rag_reply(question: str) -> dict:
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
        source = payload.get("chunk_file") or payload.get("source") or payload.get("filename") or "Unknown"
        score = round(r.score, 4)

        context_parts.append(text)
        sources.append({
            "source": source,
            "snippet": text[:300],
            "score": score,
        })

    context = "\n\n---\n\n".join(context_parts)

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
        options={"temperature": 0.1, "num_predict": 250},
    )

    return {
        "answer": response["message"]["content"],
        "sources": sources,
        "query_type": "research",
    }


# ─── Public Entry Point ───────────────────────────────────────────────────────

def ask_question(question: str) -> dict:
    if _is_casual(question):
        return _casual_reply(question)
    return _rag_reply(question)