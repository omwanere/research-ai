# 🔬 Research AI

A **local-first AI research assistant** that lets you upload PDF papers, ask questions in natural language, and receive **streamed answers with source citations** — all running entirely on your machine.

> No cloud APIs. No subscriptions. No data leaves your device.

---

## ✨ Features

| Feature | Status |
|---|---|
| PDF upload & ingestion | ✅ |
| Semantic search (BGE embeddings) | ✅ |
| RAG-based answers | ✅ |
| Streaming responses (SSE) | ✅ |
| Source citations with relevance scores | ✅ |
| Casual chat support | ✅ |
| Drag-and-drop PDF upload | ✅ |
| Document knowledge base panel | ✅ |
| Anti-hallucination prompt | ✅ |
| Dark-themed modern UI | ✅ |

---

## 🏗️ Architecture

```
User
 │
 ▼
Next.js Frontend (port 3000)
 │  SSE streaming  │  REST API
 ▼                 ▼
FastAPI Backend (port 8000)
 ├── /ask/stream   → Ollama (tinyllama) + Qdrant RAG
 ├── /ask          → Non-streaming fallback
 ├── /search       → Semantic search
 ├── /upload       → PDF → text → chunks → embeddings → Qdrant
 ├── /docs-list    → List indexed documents
 └── /health       → Health check

Local Services:
 ├── Qdrant        → Vector database (local file mode)
 ├── Ollama        → LLM inference (tinyllama / phi3 / mistral)
 └── BGE           → Sentence embeddings (BAAI/bge-small-en-v1.5)
```

---

## 🛠️ Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — REST + SSE API
- [Qdrant](https://qdrant.tech/) — Local vector database
- [sentence-transformers](https://www.sbert.net/) — `BAAI/bge-small-en-v1.5` embeddings
- [Ollama](https://ollama.com/) — Local LLM (`tinyllama`)
- [PyMuPDF](https://pymupdf.readthedocs.io/) — PDF text extraction

**Frontend**
- [Next.js 16](https://nextjs.org/) — App Router
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling
- Server-Sent Events (SSE) — Real-time streaming

---

## 🚀 Getting Started

### Prerequisites

1. **Python 3.10+**
2. **Node.js 18+**
3. **[Ollama](https://ollama.com/)** installed and running
4. Pull the LLM model:
   ```bash
   ollama pull tinyllama
   ```

### 1. Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> API docs available at: http://127.0.0.1:8000/docs

### 2. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> Open: http://localhost:3000

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/ask?query=...` | Non-streaming RAG answer |
| `GET` | `/ask/stream?query=...` | **Streaming SSE answer** |
| `GET` | `/search?query=...` | Semantic search results |
| `POST` | `/upload` | Upload & ingest a PDF |
| `GET` | `/docs-list` | List indexed documents |

### Streaming Events (`/ask/stream`)

```
event: token    data: {"token": "word "}
event: sources  data: {"sources": [...], "query_type": "research"}
event: done     data: {"done": true}
event: error    data: {"message": "..."}
```

---

## 📁 Project Structure

```
research-ai/
├── Backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + routers
│   │   ├── config.py            # Centralized settings
│   │   ├── db.py                # Qdrant singleton client
│   │   ├── routes/
│   │   │   ├── ask.py           # /ask + /ask/stream
│   │   │   ├── search.py        # /search
│   │   │   └── upload.py        # /upload
│   │   └── services/
│   │       ├── rag_service.py   # RAG pipeline + streaming
│   │       ├── search_service.py
│   │       └── upload_service.py # PDF → chunks → Qdrant
│   └── requirements.txt
│
├── Frontend/
│   └── app/
│       ├── layout.js
│       ├── globals.css
│       └── chat/
│           └── page.js          # Full streaming chat UI
│
├── Ai-engine/                   # Standalone ingestion scripts
│   ├── ingestion/
│   ├── chunking/
│   ├── embeddings/
│   └── vector_db/
│
└── Data/                        # Local data (gitignored)
    ├── pdfs/
    └── vector_db/
```

---

## ⚙️ Configuration

Edit `Backend/app/config.py` to change:

| Setting | Default | Description |
|---------|---------|-------------|
| `OLLAMA_MODEL` | `tinyllama` | Ollama model to use |
| `EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5` | Embedding model |
| `COLLECTION_NAME` | `research_papers` | Qdrant collection |
| `RAG_TOP_K` | `5` | Chunks retrieved per query |
| `CHUNK_SIZE` | `400` | Words per chunk (in upload_service) |

To use a more powerful model:
```bash
ollama pull mistral
# then set OLLAMA_MODEL = "mistral" in config.py
```

---

## 🔒 Privacy

All processing happens locally:
- Embeddings computed on-device via `sentence-transformers`
- LLM inference via Ollama (no external API calls)
- Vectors stored in a local Qdrant file database
- PDFs never leave your machine

---

## 📝 License

MIT
