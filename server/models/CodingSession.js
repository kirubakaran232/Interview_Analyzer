const mongoose = require('mongoose');

const codingSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  language: { type: String, required: true },
  level: { type: String, required: true },
  topic: { type: String, required: true },
  question: { type: Object, required: true },
  code: { type: String, default: '' },
  hints: { type: [String], default: [] },
  feedback: { type: Object, default: {} },
  status: { type: String, enum: ['started', 'submitted'], default: 'started' },
}, { timestamps: true });

module.exports = mongoose.model('CodingSession', codingSessionSchema);
