from fastapi import APIRouter
from Backend.app.services.rag_service import ask_question

router = APIRouter(prefix="/ask", tags=["AI Assistant"])


@router.get("/")
def ask(query: str):
    return {"answer": ask_question(query)}