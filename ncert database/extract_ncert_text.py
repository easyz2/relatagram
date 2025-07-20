import pdfplumber
import os
import json

# Paths based on your folder setup
BASE_DIR = os.path.dirname(__file__)
PDF_DIR = os.path.join(BASE_DIR, "ncert_pdfs")
OUTPUT_DIR = os.path.join(BASE_DIR, "extracted_text")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def clean_text(text):
    return ' '.join(text.split())  # Strip line breaks, excessive spaces

def extract_text_from_pdf(file_path):
    print(f"📘 Extracting: {file_path}")
    pages = []
    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                pages.append({
                    "page": i + 1,
                    "text": clean_text(text)
                })
    return pages

def main():
    for filename in os.listdir(PDF_DIR):
        if filename.endswith(".pdf"):
            full_path = os.path.join(PDF_DIR, filename)
            pages = extract_text_from_pdf(full_path)

            out_name = filename.replace(".pdf", ".json")
            with open(os.path.join(OUTPUT_DIR, out_name), "w", encoding="utf-8") as f:
                json.dump(pages, f, indent=2, ensure_ascii=False)
                print(f"✅ Saved: {out_name} ({len(pages)} pages)")

if __name__ == "__main__":
    main()
