const mongoose = require('mongoose');

const turnSchema = new mongoose.Schema({
  speaker: { type: String, required: true },
  role: { type: String, enum: ['candidate', 'ai-participant', 'moderator'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const groupDiscussionSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  durationMinutes: { type: Number, default: 10 },
  participants: { type: [String], default: ['Asha', 'Rohan', 'Meera'] },
  turns: { type: [turnSchema], default: [] },
  scores: {
    content: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    leadership: { type: Number, default: 0 },
    initiative: { type: Number, default: 0 },
    listening: { type: Number, default: 0 },
    overall: { type: Number, default: 0 },
  },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  summary: { type: String, default: '' },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
}, { timestamps: true });

module.exports = mongoose.model('GroupDiscussionSession', groupDiscussionSessionSchema);
