import os

INPUT_FOLDER = "data/processed"
OUTPUT_FOLDER = "data/chunks"

CHUNK_SIZE = 500


def split_text(text, chunk_size=CHUNK_SIZE):

    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)

    return chunks


def process_all_files():

    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    for file in os.listdir(INPUT_FOLDER):

        if file.endswith(".txt"):

            path = os.path.join(INPUT_FOLDER, file)

            with open(path, "r", encoding="utf-8") as f:
                text = f.read()

            chunks = split_text(text)

            for i, chunk in enumerate(chunks):

                chunk_file = f"{file}_chunk_{i}.txt"

                with open(os.path.join(OUTPUT_FOLDER, chunk_file), "w", encoding="utf-8") as out:
                    out.write(chunk)

            print(file, "→", len(chunks), "chunks created")


if __name__ == "__main__":
    process_all_files()