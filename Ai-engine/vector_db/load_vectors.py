import json
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

# connect to local vector DB
client = QdrantClient(path="data/vector_db")

# load embeddings
with open("data/embeddings.json", "r") as f:
    embeddings = json.load(f)

points = []

for i, item in enumerate(embeddings):
    points.append(
        PointStruct(
            id=i,
            vector=item["embedding"],
            payload={"file": item["file"]}
        )
    )

# insert vectors
client.upsert(
    collection_name="research_papers",
    points=points
)

print("Inserted", len(points), "vectors into Qdrant")

client.close()