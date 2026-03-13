import fitz
import os

PDF_FOLDER = "data/pdfs"
OUTPUT_FOLDER = "data/processed"


def extract_text_from_pdf(pdf_path):

    doc = fitz.open(pdf_path)

    text = ""

    for page in doc:
        text += page.get_text()

    return text


def process_all_pdfs():

    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    for file in os.listdir(PDF_FOLDER):

        if file.endswith(".pdf"):

            pdf_path = os.path.join(PDF_FOLDER, file)

            print("Processing:", file)

            text = extract_text_from_pdf(pdf_path)

            output_file = os.path.join(
                OUTPUT_FOLDER,
                file.replace(".pdf", ".txt")
            )

            with open(output_file, "w", encoding="utf-8") as f:
                f.write(text)


if __name__ == "__main__":
    process_all_pdfs()