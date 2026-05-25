const mongoose = require('mongoose');

const communicationSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mode: {
    type: String,
    enum: ['Self Introduction', 'Storytelling', 'Professional English', 'HR Answer', 'Presentation Practice'],
    required: true,
  },
  prompt: { type: String, required: true },
  transcript: { type: String, required: true },
  duration: { type: Number, default: 0 },
  speechMetrics: {
    wpm: { type: Number, default: 0 },
    fillerCount: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
  },
  scores: {
    fluency: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    vocabulary: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    professionalTone: { type: Number, default: 0 },
    overall: { type: Number, default: 0 },
  },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  correctedVersion: { type: String, default: '' },
  practicePlan: { type: [String], default: [] },
  summary: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('CommunicationSession', communicationSessionSchema);
