const mongoose = require('mongoose');

const questionEntrySchema = new mongoose.Schema({
  questionText: String,
  questionType: { type: String, enum: ['HR', 'Technical', 'Follow-up', 'Introduction', 'General'], default: 'General' },
  transcript: { type: String, default: '' },
  fillerWords: { type: Number, default: 0 },
  speakingSpeed: { type: Number, default: 0 }, // WPM
  duration: { type: Number, default: 0 },       // seconds
  aiEvaluation: {
    answerRelevance: { type: Number, default: 0 },
    grammarScore: { type: Number, default: 0 },
    clarityScore: { type: Number, default: 0 },
    technicalAccuracy: { type: Number, default: 0 },
    suggestions: { type: [String], default: [] },
    grammarIssues: { type: [String], default: [] },
    overallCommentary: { type: String, default: '' },
  },
}, { _id: false });

const scoresSchema = new mongoose.Schema({
  communication: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  bodyLanguage: { type: Number, default: 0 },
  technicalExplanation: { type: Number, default: 0 },
  hrReadiness: { type: Number, default: 0 },
  overall: { type: Number, default: 0 },
}, { _id: false });

const bodyLanguageSchema = new mongoose.Schema({
  eyeContactPercent: { type: Number, default: 0 },
  postureScore: { type: Number, default: 0 },
  expressionSummary: { type: String, default: '' },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sessionDate: {
    type: Date,
    default: Date.now,
  },
  domain: { type: String, required: true },
  skills: { type: [String], default: [] },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing',
  },
  questions: { type: [questionEntrySchema], default: [] },
  scores: { type: scoresSchema, default: () => ({}) },
  bodyLanguageData: { type: bodyLanguageSchema, default: () => ({}) },
  suggestions: { type: [String], default: [] },
  duration: { type: Number, default: 0 }, // seconds
  resumeText: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
