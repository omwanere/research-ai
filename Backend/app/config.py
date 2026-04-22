import os

# Qdrant local vector DB path (relative to project root)
QDRANT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "Data", "vector_db")

# Qdrant collection name
COLLECTION_NAME = "research_papers"

# Embedding model
EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"

# Ollama model
OLLAMA_MODEL = "tinyllama"

# Number of search results to return for RAG context
RAG_TOP_K = 5
