from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.upload_service import ingest_pdf

router = APIRouter(prefix="/upload", tags=["Upload"])

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF, extract text, chunk, embed and store in Qdrant.
    Returns ingest summary.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50 MB.")

    try:
        result = ingest_pdf(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

    return result
