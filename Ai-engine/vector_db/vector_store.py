from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(path="data/vector_db")

client.recreate_collection(
    collection_name="research_papers",
    vectors_config=VectorParams(
        size=384,
        distance=Distance.COSINE
    )
)

print("Local Qdrant database created")

client.close()