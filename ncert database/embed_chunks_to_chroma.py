import os
import json
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document

CHUNK_DIR = "chunked_text"
VECTOR_DIR = "ncert_vector_db"

os.makedirs(VECTOR_DIR, exist_ok=True)

def load_chunks_from_dir():
    all_docs = []
    for filename in os.listdir(CHUNK_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(CHUNK_DIR, filename), "r", encoding="utf-8") as f:
                chunks = json.load(f)
                for chunk in chunks:
                    doc = Document(
                        page_content=chunk["text"],
                        metadata=chunk["metadata"]
                    )
                    all_docs.append(doc)
    return all_docs

def main():
    print("📦 Loading chunks...")
    documents = load_chunks_from_dir()
    print(f"🔢 Total Chunks to Embed: {len(documents)}")

    print("🔍 Using HuggingFace Embeddings (all-MiniLM-L6-v2)...")
    embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("🧠 Embedding and storing in ChromaDB...")
    vectordb = Chroma.from_documents(documents, embedding=embedding, persist_directory=VECTOR_DIR)

    vectordb.persist()
    print(f"✅ Embedding complete. Vector DB saved at: {VECTOR_DIR}")

if __name__ == "__main__":
    main()
