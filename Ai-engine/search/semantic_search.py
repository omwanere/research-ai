from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

# Load embedding model
model = SentenceTransformer("BAAI/bge-small-en-v1.5")

# Connect to local Qdrant database
client = QdrantClient(path="data/vector_db")


def search_papers(query):

    print("\nUser query:", query)

    # Convert query to embedding vector
    query_vector = model.encode(query).tolist()

    # Search vector database
    results = client.query_points(
        collection_name="research_papers",
        query=query_vector,
        limit=5
    )

    print("\nTop Results:\n")

    # Display results
    for result in results.points:
        print("Paper:", result.payload["file"])
        print("Similarity Score:", round(result.score, 4))
        print("-" * 40)


if __name__ == "__main__":

    query = input("Enter research topic: ")

    search_papers(query)

    # Properly close Qdrant client
    client.close()