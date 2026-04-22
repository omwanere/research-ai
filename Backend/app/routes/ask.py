from fastapi import APIRouter
from app.services.rag_service import ask_question

router = APIRouter(prefix="/ask", tags=["AI Assistant"])


@router.get("")
def ask(query: str):
    result = ask_question(query)
    return result