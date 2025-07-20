import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load the GEMINI API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def test_gemini():
    try:
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        chat = model.start_chat()
        response = chat.send_message("Summarize Newton's first law of motion in simple words.")
        print("✅ Gemini Summary:\n", response.text.strip())
    except Exception as e:
        print("❌ Gemini Error:", str(e))

if __name__ == "__main__":
    test_gemini()
