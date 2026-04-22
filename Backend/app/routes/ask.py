from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.rag_service import ask_question, stream_answer

router = APIRouter(prefix="/ask", tags=["AI Assistant"])


@router.get("")
def ask(query: str):
    """Non-streaming RAG answer with sources."""
    return ask_question(query)


@router.get("/stream")
def ask_stream(query: str):
    """
    Streaming SSE endpoint. Emits:
      event: token   — individual response tokens
      event: sources — source list + query_type (sent after last token)
      event: done    — signals stream end
      event: error   — on failure
    """
    return StreamingResponse(
        stream_answer(query),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",       # disable nginx buffering
            "Connection": "keep-alive",
        },
    )