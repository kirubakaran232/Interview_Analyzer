const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { callGemini } = require('./geminiService');
const { buildResumeFeedbackPrompt } = require('../prompts/resumePrompt');
const { scoreResume } = require('../utils/resumeScoring');

const extractResumeText = async (file) => {
  if (file.mimetype === 'application/pdf') {
    const result = await pdfParse(file.buffer);
    return result.text;
  }

  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.originalname.toLowerCase().endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  throw new Error('Only PDF and DOCX files are supported');
};

const analyzeResume = async ({ resumeText, jobDescription }) => {
  const heuristic = scoreResume({ resumeText, jobDescription });
  let aiFeedback = {};

  try {
    aiFeedback = await callGemini(
      buildResumeFeedbackPrompt({ resumeText, jobDescription, heuristic }),
      { temperature: 0.3, maxOutputTokens: 1400 }
    );
  } catch (error) {
    console.warn('Gemini resume feedback fallback:', error.message);
  }

  const grammarClarity = typeof aiFeedback.grammarClarityScore === 'number'
    ? Math.round(aiFeedback.grammarClarityScore / 10)
    : heuristic.sectionScores.grammarClarity;
  const sectionScores = { ...heuristic.sectionScores, grammarClarity };
  const atsScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0);

  return {
    atsScore,
    sectionScores,
    checks: heuristic.checks,
    matchedKeywords: heuristic.matchedKeywords,
    missingKeywords: aiFeedback.missingKeywords || heuristic.missingKeywords,
    missingSkills: aiFeedback.missingSkills || [],
    improvedBullets: aiFeedback.improvedBullets || [],
    suggestions: aiFeedback.suggestions || [],
    summary: aiFeedback.summary || 'Resume analysis completed.',
  };
};

module.exports = { extractResumeText, analyzeResume };
