import ollama
from sentence_transformers import SentenceTransformer
from Backend.app.db import get_qdrant_client

model = SentenceTransformer("BAAI/bge-small-en-v1.5")


def ask_question(question):

    vector = model.encode(question).tolist()

    results = get_qdrant_client().query_points(
        collection_name="research_papers",
        query=vector,
        limit=5
    )

    context = ""

    for r in results.points:
        context += r.payload["text"] + "\n\n"

    prompt = f"""
Use the research excerpts below to answer the question.

Context:
{context}

Question:
{question}

Answer clearly.
"""

    response = ollama.chat(
        model="phi3",
        messages=[{"role": "user", "content": prompt}]
    )

    return response["message"]["content"]