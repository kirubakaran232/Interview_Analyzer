const mongoose = require('mongoose');

const codingProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  problemId: { type: String, required: true },
  status: { type: String, enum: ['Not Started', 'Solved', 'Revisit'], default: 'Not Started' },
}, { timestamps: true });

codingProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('CodingProgress', codingProgressSchema);
