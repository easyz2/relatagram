## Relatagram – AI-Powered Educational Video App : Relatagram is an AI-enhanced educational video platform that allows users to upload YouTube videos, automatically extract transcripts, map timestamped NCERT concepts using Gemini AI, and present summarized educational content in a dynamic, student-friendly interface.

## Features

1. YouTube Video Import : Add any YouTube video by link or ID.

2. Transcript Extraction : Automatically fetches the full transcript from the video using youtube-transcript-api.

3. AI-Powered Concept Mapping : Maps NCERT-based concepts from the transcript using RAG and provides detailed informartion about the topic using Gemini (Google AI) and optionally aligns them with timestamps.

4. Timestamped Concept Display :While watching videos, the app dynamically displays concepts relevant to the current timestamp.

5. Channel-wise Grouping : Videos are automatically grouped by their channels for easy browsing.

6. Search Functionality : Full-text search across video titles, channels, transcripts, and mapped concepts.

7. Pull to refresh.

8. Automatic sliding video carousel.

## CLONE REPOSITORY 
```bash
git clone https://github.com/YOUR_USERNAME/relatagram.git
cd relatagram
```

## Backend Setup (/backend) :

``` bash
cd backend
npm install
```

## Create a .env file with the following:
``` env
MONGO_URI=mongodb+srv://himeshjain123456789:YY34lgUgNQ1auF3k@cluster0.8qrdyzu.mongodb.net/ncertapp?retryWrites=true&w=majority&appName=Cluster0
YOUTUBE_API_KEY=Youtube_API_KEY
GEMINI_API_KEY=GEMINI_KEY

```

## Start the backend server
``` bash
node index.js
```

### # Transcript Microservice (/transcript)

## Install Dependencies
``` bash
cd pip install youtube-transcript-api
```
## Start Service
``` bash
 cd relatagram_folder_location\relatagram\transcript\transcript.py
```
** or START Manually by double clicking on transcript.py file

### # NCERT AI Concept Mapper (/ncert_database)
## Setup Dependencies
``` bash
pip install Flask langchain-community huggingface-hub sentence-transformers python-dotenv google-generativeai chromadb
```
## Create a .env file with the following:
``` env
YOUTUBE_API_KEY=Youtube_API_KEY
GEMINI_API_KEY=GEMINI_KEY

```

## Start Server
``` bash
cd relatagram_folder_location\relatagram\ncert database\ncert_mapper_server.py
```
** or or START Manually by double clicking on ncert_mapper_server.py file

## # Database 
More ncert or books data can be simply added by using the python script in the folder as follows :

  1. Save the ncert chapter pdf in ncert_pdfs folder with name " Class Subject ch no."
     ```
      eg. 11th Physics ch 4
     ``` 
  2. Run the extracting script :
     ``` bash
     extract_ncert_text.py
     ```
  3. Run the Chunk Script :
     ``` bash
     chunk_ncert_text.py
     ```
  4. Run the Vector embedding script :
     ``` bash
     embed_chunks_to_chroma.py
     ```
  5. A Folder named " /ncert_vector_db " will be created with the vector embedded chunk file

### # Frontend Setup (/frontend)
## Setup Dependencies 
``` bash
cd frontend
npm install
```
## Update Config.js
put your local ip address
```
const LOCAL_IP = 'local_ip_address'; // or your LAN IP
const PORT = 3000;

export const API_CONFIG = {
  BASE_URL: `http://${LOCAL_IP}:${PORT}/api/videos`,
  TIMEOUT: 10000,
};

export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
});

```
## Start Service
``` bash
npm start
```
or 
``` bash
npm expo start
```
## Contact
For questions, feedback or collaborations, feel free to reach out or open an issue.




