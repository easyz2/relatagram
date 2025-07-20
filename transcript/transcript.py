# transcript.py
from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

app = Flask(__name__)

@app.route('/transcript/<video_id>', methods=['GET'])
def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join([entry['text'] for entry in transcript])
        return jsonify({ "transcript": text })
    except TranscriptsDisabled:
        return jsonify({ "error": "Transcripts are disabled for this video." }), 404
    except NoTranscriptFound:
        return jsonify({ "error": "Transcript not found." }), 404
    except Exception as e:
        return jsonify({ "error": str(e) }), 500

@app.route('/health')
def health_check():
    return jsonify({ "status": "ok" })

if __name__ == '__main__':
    app.run(port=5001)
