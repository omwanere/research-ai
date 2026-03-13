import json
import requests
import os


PDF_FOLDER = "data/pdfs"


def load_papers():
    with open("data/papers.json", "r", encoding="utf-8") as f:
        return json.load(f)


def download_pdf(url, filename):

    response = requests.get(url)

    if response.status_code == 200:
        with open(filename, "wb") as f:
            f.write(response.content)
        print("Downloaded:", filename)

    else:
        print("Failed:", url)


def download_all_pdfs():

    papers = load_papers()

    os.makedirs(PDF_FOLDER, exist_ok=True)

    for i, paper in enumerate(papers):

        pdf_url = paper["pdf_url"]

        filename = f"{PDF_FOLDER}/paper_{i}.pdf"

        download_pdf(pdf_url, filename)


if __name__ == "__main__":
    download_all_pdfs()