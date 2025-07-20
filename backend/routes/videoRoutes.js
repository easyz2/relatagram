// routes/videoRoutes.js
const express = require('express');
const axios = require('axios');
const Video = require('../models/Video');
const router = express.Router();

module.exports = (youtubeTranscriptClient, { transcriptUrl, aiMapperUrl }) => {
  const router = express.Router();

  const fetchYouTubeMetadata = async (videoId) => {
    const key = process.env.YOUTUBE_API_KEY;
    const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${key}`;
    const res = await axios.get(ytUrl);
    const snippet = res.data.items?.[0]?.snippet;
    if (!snippet) throw new Error('Invalid video ID or metadata not found.');
    return {
      title: snippet.title,
      channel: snippet.channelTitle,
      thumbnail: snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/0.jpg`,
    };
  };

  // POST /api/videos – Add a new video
  router.post('/', async (req, res) => {
    const { videoId, includeTimestamps = true } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Missing videoId.' });
    }

    try {
      const existing = await Video.findOne({ videoId });
      if (existing) return res.status(200).json(existing);

      const { title, channel, thumbnail } = await fetchYouTubeMetadata(videoId);

      const transcriptRes = await axios.get(`${transcriptUrl}/transcript/${videoId}`);
      const transcriptText = transcriptRes.data.transcript;

      if (!transcriptText || transcriptText.length < 30) {
        return res.status(400).json({ error: 'Transcript too short or unavailable.' });
      }

      const mapRes = await axios.post(`${aiMapperUrl}/map-concepts`, {
        transcript: transcriptText,
        includeTimestamps,
      });

      // --- CRITICAL CHANGE HERE ---
      // Destructure 'title' (AI-generated) from mapRes.data
      const { concepts, summary, title: aiConceptTitle, timestampedConcepts = [] } = mapRes.data;

      const newVideo = new Video({
        videoId,
        title, // This is the YouTube video title
        channel,
        thumbnail,
        transcript: transcriptText,
        aiMappedConcepts: concepts,
        aiConceptSummary: summary,
        aiConceptTitle: aiConceptTitle, // <-- ASSIGN AI-GENERATED TITLE HERE
        timestampedConcepts,
        relatedVideos: []
      });

      await newVideo.save();
      res.status(201).json(newVideo);

    } catch (err) {
      console.error('Error saving video:', err.message);
      res.status(500).json({ error: 'Failed to save video. Check videoId, API keys, and services.' });
    }
  });

  // Remaining routes unchanged
  router.get('/', async (req, res) => {
    try {
      const videos = await Video.find().sort({ createdAt: -1 });
      res.json(videos);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query too short' });
    }

    try {
      const regex = new RegExp(q, 'i');
      const results = await Video.find({
        $or: [
          { title: regex },
          { channel: regex },
          { transcript: regex },
          { aiMappedConcepts: regex }
        ]
      }).limit(15);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: 'Search failed' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      res.json(video);
    } catch (err) {
      res.status(500).json({ error: 'Fetch failed' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const result = await Video.findByIdAndDelete(req.params.id);
      if (!result) return res.status(404).json({ error: 'Video not found' });
      res.json({ message: 'Video deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  router.get('/:id/concepts', async (req, res) => {
    const timestamp = Number(req.query.ts);
    if (isNaN(timestamp)) return res.status(400).json({ error: 'Invalid timestamp' });

    try {
      const video = await Video.findById(req.params.id);
      if (!video) return res.status(404).json({ error: 'Video not found' });

      const nearConcepts = video.timestampedConcepts.filter(tc =>
        Math.abs(tc.timestamp - timestamp) <= 5
      );

      res.json({ concepts: nearConcepts });
    } catch (err) {
      res.status(500).json({ error: 'Concept lookup failed' });
    }
  });

  return router;
};