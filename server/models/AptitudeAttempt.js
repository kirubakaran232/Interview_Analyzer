const mongoose = require('mongoose');

const aptitudeAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  question: { type: Object, required: true },
  selectedAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, required: true },
  timeTakenSeconds: { type: Number, default: 0 },
  mode: { type: String, enum: ['practice', 'mock'], default: 'practice' },
  mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeMockTest', default: null },
}, { timestamps: true });

module.exports = mongoose.model('AptitudeAttempt', aptitudeAttemptSchema);
