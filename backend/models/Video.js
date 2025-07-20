// models/Video.js
const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  channel: String,
  thumbnail: String,
  transcript: String,
  aiConceptTitle: String,
  aiMappedConcepts: [String],
  aiConceptSummary: String,
  timestampedConcepts: [
    {
      timestamp: { type: Number, min: 0 },
      concept: String
    }
  ],
  relatedVideos: [
    {
      videoId: String,
      title: String,
      thumbnail: String,
      similarity: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

VideoSchema.index({ title: 'text', transcript: 'text', aiMappedConcepts: 1 });

module.exports = mongoose.model('Video', VideoSchema);
