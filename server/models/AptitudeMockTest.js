const mongoose = require('mongoose');

const aptitudeMockTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  difficulty: { type: String, required: true },
  questions: { type: [Object], default: [] },
  answers: { type: [Object], default: [] },
  totalQuestions: { type: Number, default: 30 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  averageTimePerQuestion: { type: Number, default: 0 },
  finalScore: { type: Number, default: 0 },
  rankStylePerformance: { type: String, default: '' },
  topicWiseAnalysis: { type: Object, default: {} },
  suggestions: { type: [String], default: [] },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
}, { timestamps: true });

module.exports = mongoose.model('AptitudeMockTest', aptitudeMockTestSchema);
