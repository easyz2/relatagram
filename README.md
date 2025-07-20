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

## Transcript Microservice (/transcript)
``` bash
 cd relatagram_folder_location\relatagram\transcript\transcript.py
```
** or START Manually by double clicking on transcript.py file

