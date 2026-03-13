from sentence_transformers import SentenceTransformer
import os
import json

TEXT_FOLDER = "data/processed"
OUTPUT_FILE = "data/embeddings.json"


model = SentenceTransformer("BAAI/bge-small-en-v1.5")


def generate_embeddings():

    embeddings_data = []

    for file in os.listdir(TEXT_FOLDER):

        if file.endswith(".txt"):

            path = os.path.join(TEXT_FOLDER, file)

            with open(path, "r", encoding="utf-8") as f:
                text = f.read()

            print("Embedding:", file)

            embedding = model.encode(text).tolist()

            embeddings_data.append({
                "file": file,
                "embedding": embedding
            })

    with open(OUTPUT_FILE, "w") as f:
        json.dump(embeddings_data, f)


if __name__ == "__main__":
    generate_embeddings()