import json
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

client = QdrantClient(path="data/vector_db")

with open("data/chunk_embeddings.json", "r") as f:
    embeddings = json.load(f)

points = []

for i, item in enumerate(embeddings):
    points.append(
        PointStruct(
            id=i,
            vector=item["embedding"],
            payload={
                "chunk_file": item["chunk_file"],
                "text": item["text"]
            }
        )
    )

client.upsert(
    collection_name="research_papers",
    points=points
)

print("Inserted", len(points), "chunks into Qdrant")

client.close()