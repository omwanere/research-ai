import arxiv
import json

def fetch_papers(query="machine learning", max_results=10):
    
    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.SubmittedDate
    )

    papers = []

    for result in search.results():
        paper = {
            "title": result.title,
            "authors": [author.name for author in result.authors],
            "summary": result.summary,
            "pdf_url": result.pdf_url,
            "published": str(result.published),
            "categories": result.categories
        }

        papers.append(paper)

    return papers


def save_papers(papers):
    
    with open("data/papers.json", "w", encoding="utf-8") as f:
        json.dump(papers, f, indent=4)


if __name__ == "__main__":

    papers = fetch_papers("artificial intelligence", 20)

    save_papers(papers)

    print("Downloaded", len(papers), "papers")