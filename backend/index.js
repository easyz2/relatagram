// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const TranscriptClient = require('youtube-transcript-api');
const youtubeTranscriptClient = new TranscriptClient();

const MONGO_URI = process.env.MONGO_URI;
const AI_MAPPER_URL = process.env.AI_MAPPER_URL || 'http://localhost:5002';
const TRANSCRIPT_SERVICE_URL = process.env.TRANSCRIPT_SERVICE_URL || 'http://localhost:5001';

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined.');
  process.exit(1);
}

async function checkServiceHealth(url, label) {
  try {
    const res = await axios.get(`${url}/health`);
    if (res.status === 200) {
      console.log(`✅ ${label} is healthy`);
    } else {
      console.warn(`⚠️ ${label} returned unexpected status`);
    }
  } catch (err) {
    console.error(`❌ ${label} is not reachable at ${url}`);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    await youtubeTranscriptClient.ready;
    console.log('✅ Transcript Client is ready');

    // Health checks for AI microservices
    await checkServiceHealth(TRANSCRIPT_SERVICE_URL, 'Transcript Service');
    await checkServiceHealth(AI_MAPPER_URL, 'AI Concept Mapper');

    // Inject config into routes
    const videoRoutes = require('./routes/videoRoutes')(youtubeTranscriptClient, {
      transcriptUrl: TRANSCRIPT_SERVICE_URL,
      aiMapperUrl: AI_MAPPER_URL,
    });
    app.use('/api/videos', videoRoutes);

    app.get('/test', (req, res) => {
      res.json({ message: 'Backend is running!', timestamp: new Date().toISOString() });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
}

startServer();
