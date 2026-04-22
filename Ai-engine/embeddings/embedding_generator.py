import os
import json
from sentence_transformers import SentenceTransformer

CHUNK_FOLDER = "data/chunks"
OUTPUT_FILE = "data/chunk_embeddings.json"

model = SentenceTransformer("BAAI/bge-small-en-v1.5")


def generate_embeddings():

    embeddings_data = []

    for file in os.listdir(CHUNK_FOLDER):

        if file.endswith(".txt"):

            path = os.path.join(CHUNK_FOLDER, file)

            with open(path, "r", encoding="utf-8") as f:
                text = f.read()

            print("Embedding:", file)

            embedding = model.encode(text).tolist()

            embeddings_data.append({
                "chunk_file": file,
                "text": text,
                "embedding": embedding
            })

    with open(OUTPUT_FILE, "w") as f:
        json.dump(embeddings_data, f)

    print("\nEmbeddings generated:", len(embeddings_data))


if __name__ == "__main__":
    generate_embeddings()