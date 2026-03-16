from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Backend.app.routes import search, ask

app = FastAPI(title="Research AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # Add frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(ask.router)

@app.get("/")
def home():
    return {"message": "Research AI API running"}