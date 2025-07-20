import os
import json
import re # Import the regular expression module

INPUT_DIR = "extracted_text"
OUTPUT_DIR = "chunked_text"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# These global defaults are now largely replaced by filename parsing
# but can serve as fallbacks or for debugging if parsing fails.
DEFAULT_CLASS = "Unknown Class"
DEFAULT_SUBJECT = "Unknown Subject"
DEFAULT_CHAPTER = "Unknown Chapter"

CHUNK_SIZE = 300  # words per chunk
OVERLAP = 50      # optional overlap between chunks

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=OVERLAP):
    words = text.split()
    chunks = []
    # Ensure chunk_size - overlap is not zero or negative
    step = max(1, chunk_size - overlap)
    for i in range(0, len(words), step):
        chunk = ' '.join(words[i:min(i + chunk_size, len(words))]) # Use min to prevent out of bounds
        if chunk: # Only add non-empty chunks
            chunks.append(chunk)
    return chunks

def parse_metadata_from_filename(filename):
    # Remove .json extension
    base_name = filename.replace(".json", "")

    # Define regex patterns for different naming conventions
    # Pattern 1: e.g., "12th phy ch 12" -> 12, phy, 12 (class, subject, chapter)
    match_phy_chem = re.match(r'(\d+)(?:th|st|nd|rd)?\s+(phy|chem)\s+ch\s+(\d+)', base_name, re.IGNORECASE)
    # Pattern 2: e.g., "6th math ch 3" -> 6, math, 3 (class, subject, chapter)
    # Note: 'math' is not captured as a group here, it's literal in the regex.
    match_math = re.match(r'(\d+)(?:th|st|nd|rd)?\s+math\s+ch\s+(\d+)', base_name, re.IGNORECASE)


    current_class = DEFAULT_CLASS
    current_subject = DEFAULT_SUBJECT
    current_chapter = DEFAULT_CHAPTER

    if match_phy_chem:
        current_class = f"Class {match_phy_chem.group(1)}"
        # map 'phy' to 'Physics' and 'chem' to 'Chemistry'
        subject_abbr = match_phy_chem.group(2).lower()
        if subject_abbr == "phy":
            current_subject = "Physics"
        elif subject_abbr == "chem":
            current_subject = "Chemistry"
        else:
            current_subject = match_phy_chem.group(2).capitalize() # Fallback, though not expected for this regex
        current_chapter = match_phy_chem.group(3)
    elif match_math:
        current_class = f"Class {match_math.group(1)}"
        current_subject = "Math" # 'math' is not a capturing group, so hardcode
        current_chapter = match_math.group(2) # Corrected: chapter is group 2
    else:
        print(f"Warning: Could not parse metadata from filename: '{filename}'. Using defaults.")

    return current_class, current_subject, current_chapter

def chunk_file(file_path, output_name):
    with open(file_path, "r", encoding="utf-8") as f:
        pages = json.load(f)

    all_chunks = []

    # Parse class, subject, chapter from the output_name (which is filename without .json)
    current_class, current_subject, current_chapter = parse_metadata_from_filename(output_name)

    for page in pages:
        page_num = page["page"]
        text = page["text"]
        chunks = chunk_text(text)

        for i, chunk in enumerate(chunks):
            chunk_obj = {
                "chunk_id": f"{output_name}_p{page_num}_c{i}",
                "text": chunk,
                "metadata": {
                    "class": current_class,
                    "subject": current_subject,
                    "chapter": current_chapter,
                    "page": page_num
                }
            }
            all_chunks.append(chunk_obj)

    return all_chunks

def main():
    print(f"Scanning for extracted text files in: {INPUT_DIR}")
    for filename in os.listdir(INPUT_DIR):
        if filename.endswith(".json"):
            full_path = os.path.join(INPUT_DIR, filename)
            output_name = filename.replace(".json", "") # Name without .json extension

            print(f"⚙️ Chunking file: {filename}")
            chunks = chunk_file(full_path, output_name)

            out_path = os.path.join(OUTPUT_DIR, output_name + "_chunks.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(chunks, f, indent=2, ensure_ascii=False)
            print(f"✅ Chunked and saved to: {out_path} ({len(chunks)} chunks)")
        else:
            print(f"Skipping non-JSON file: {filename}")

if __name__ == "__main__":
    main()