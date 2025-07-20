# ncert_mapper_server.py
from flask import Flask, request, jsonify
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json # Import the json module

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
VECTOR_DIR = "ncert_vector_db"

embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectordb = Chroma(persist_directory=VECTOR_DIR, embedding_function=embedding)
retriever = vectordb.as_retriever(search_kwargs={"k": 5})

def summarize_with_gemini(text):
    prompt = f"""
You are an educational assistant. Read the NCERT content below.

Please provide:
1. A concise, student-friendly title (5-10 words) for the content.
2. A summary of the content in 2–3 clear, student-friendly lines. Focus on what the learner will understand, and connect it to textbook concepts like physics, biology, or math.

Format your response as a JSON object with two keys: "title" and "summary".

Content:
{text}
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash") # Using the updated model name
        
        # Configure the model to output JSON
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        
        # Parse the JSON response
        response_data = json.loads(response.text.strip())
        
        # Extract title and summary
        title = response_data.get("title", "No Title Available")
        summary = response_data.get("summary", "Summary not available.")
        
        return {"title": title, "summary": summary}
    except Exception as e:
        print(f"Error during Gemini summarization: {e}")
        return {"title": "Error Generating Title", "summary": "Summary not available."}

@app.route("/map-concepts", methods=["POST"])
def map_concepts():
    data = request.get_json()
    transcript = data.get("transcript", "")
    include_ts = data.get("includeTimestamps", False)

    if not transcript or len(transcript.strip()) < 20:
        return jsonify({ "error": "Transcript too short or missing." }), 400

    try:
        results = retriever.get_relevant_documents(transcript)
        if not results:
            return jsonify({
                "concepts": [],
                "summary": "No concepts found.",
                "title": "No Title Found", # Add default title for no results
                "timestampedConcepts": []
            })

        concepts = []
        for doc in results:
            meta = doc.metadata
            label = f"{meta.get('class', 'Unknown')} – {meta.get('subject', 'Unknown')} – Chapter {meta.get('chapter', '?')}, Page {meta.get('page', 'N/A')}"
            if label not in concepts:
                concepts.append(label)

        top_chunks = " ".join([doc.page_content.strip().replace("\n", " ") for doc in results[:3]])
        
        # Call the updated summarize_with_gemini function
        summary_output = summarize_with_gemini(top_chunks)
        summary = summary_output["summary"]
        title = summary_output["title"]

        timestamped = []
        if include_ts:
            for i, concept in enumerate(concepts[:3]):
                timestamped.append({
                    "timestamp": 30 + i * 15,  # fake spacing for demo
                    "concept": concept
                })

        return jsonify({
            "concepts": concepts,
            "summary": summary,
            "title": title, # Include the new title in the response
            "timestampedConcepts": timestamped
        })

    except Exception as e:
        print(f"Error in map_concepts: {e}")
        return jsonify({ "error": str(e) }), 500

@app.route("/health")
def health():
    return jsonify({ "status": "ok" })

if __name__ == "__main__":
    app.run(port=5002)