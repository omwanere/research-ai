from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
import ollama

model = SentenceTransformer("BAAI/bge-small-en-v1.5")
client = QdrantClient(path="data/vector_db")


def retrieve_chunks(query):

    query_vector = model.encode(query).tolist()

    results = client.query_points(
        collection_name="research_papers",
        query=query_vector,
        limit=5
    )

    chunks = []

    for result in results.points:
        chunks.append(result.payload["text"])

    return chunks


def ask_llm(question, context_chunks):

    context = "\n\n".join(context_chunks)

    prompt = f"""
You are an AI research assistant.

Use the research paper excerpts below to answer the question.

Context:
{context}

Question:
{question}

Provide a clear research summary.
"""

    response = ollama.chat(
        model="phi3",
        messages=[{"role": "user", "content": prompt}]
    )

    return response["message"]["content"]


def research_assistant(question):

    print("\nRetrieving research papers...\n")

    chunks = retrieve_chunks(question)

    answer = ask_llm(question, chunks)

    print("\nAI Research Summary:\n")
    print(answer)


if __name__ == "__main__":

    question = input("Ask a research question: ")

    research_assistant(question)

    client.close()