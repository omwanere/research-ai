from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import search, ask

app = FastAPI(
    title="Research AI API",
    description="Local-first AI research assistant with RAG + semantic search",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(search.router)
app.include_router(ask.router)


# ─── Root ─────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Research AI API is running", "status": "ok"}


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "healthy"}