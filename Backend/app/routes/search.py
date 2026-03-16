from fastapi import APIRouter
from Backend.app.services.search_service import search_papers

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/")
def search(query: str):
    return search_papers(query)