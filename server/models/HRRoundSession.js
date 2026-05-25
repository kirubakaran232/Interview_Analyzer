const mongoose = require('mongoose');

const hrAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionType: { type: String, default: 'Behavioral' },
  transcript: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  speechMetrics: {
    wpm: { type: Number, default: 0 },
    fillerCount: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
  },
  evaluation: {
    relevance: { type: Number, default: 0 },
    structure: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    professionalism: { type: Number, default: 0 },
    starMethod: { type: Number, default: 0 },
    overall: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    idealAnswer: { type: String, default: '' },
    followUpQuestion: { type: String, default: '' },
  },
}, { _id: false });

const hrRoundSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetRole: { type: String, required: true },
  experienceLevel: { type: String, enum: ['Fresher', 'Internship', '1-2 Years', '3+ Years'], default: 'Fresher' },
  companyType: { type: String, enum: ['Service Company', 'Product Company', 'Startup', 'MNC'], default: 'Service Company' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  resumeSummary: { type: String, default: '' },
  answers: { type: [hrAnswerSchema], default: [] },
  finalScores: {
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    hrReadiness: { type: Number, default: 0 },
    cultureFit: { type: Number, default: 0 },
    overall: { type: Number, default: 0 },
  },
  finalFeedback: { type: String, default: '' },
  suggestions: { type: [String], default: [] },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
}, { timestamps: true });

module.exports = mongoose.model('HRRoundSession', hrRoundSessionSchema);
