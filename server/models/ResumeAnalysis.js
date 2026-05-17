const mongoose = require('mongoose');

const sectionScoresSchema = new mongoose.Schema({
  contactInfo: { type: Number, default: 0 },
  skillsMatch: { type: Number, default: 0 },
  projectRelevance: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  education: { type: Number, default: 0 },
  keywords: { type: Number, default: 0 },
  grammarClarity: { type: Number, default: 0 },
}, { _id: false });

const resumeAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  resumeText: { type: String, required: true },
  jobDescription: { type: String, default: '' },
  atsScore: { type: Number, required: true },
  sectionScores: { type: sectionScoresSchema, default: () => ({}) },
  checks: { type: Object, default: {} },
  matchedKeywords: { type: [String], default: [] },
  missingKeywords: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  improvedBullets: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  summary: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
