from fastapi import APIRouter
from app.services.search_service import search_papers

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
def search(query: str, limit: int = 5):
    return search_papers(query, limit=limit)