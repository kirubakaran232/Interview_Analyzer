const { callGemini } = require('./geminiService');
const {
  buildHRQuestionPrompt,
  buildHREvaluationPrompt,
  buildHRFinalPrompt,
} = require('../prompts/hrRoundPrompt');

const generateHRQuestion = async ({ session }) => {
  try {
    const result = await callGemini(buildHRQuestionPrompt({ session, previousAnswers: session.answers || [] }), {
      temperature: 0.8,
      maxOutputTokens: 500,
    });
    if (result.question) return result;
  } catch (error) {
    console.warn('HR question fallback:', error.message);
  }

  return {
    question: 'Tell me about yourself and why you are interested in this role.',
    questionType: 'General',
  };
};

const evaluateHRAnswer = async ({ question, transcript, speechMetrics }) => {
  try {
    const result = await callGemini(buildHREvaluationPrompt({ question, transcript, speechMetrics }), {
      temperature: 0.3,
      maxOutputTokens: 1100,
    });
    if (result.overall !== undefined) return result;
  } catch (error) {
    console.warn('HR evaluation fallback:', error.message);
  }

  return {
    relevance: 70,
    structure: 65,
    confidence: 70,
    professionalism: 70,
    starMethod: 60,
    overall: 67,
    strengths: ['You gave a relevant answer.'],
    improvements: ['Use a clearer structure and add a concrete example.'],
    idealAnswer: transcript,
    followUpQuestion: 'Can you share a specific example that proves this strength?',
  };
};

const finalizeHRRound = async ({ session }) => {
  try {
    const result = await callGemini(buildHRFinalPrompt({ session }), {
      temperature: 0.3,
      maxOutputTokens: 900,
    });
    if (result.finalScores?.overall !== undefined) return result;
  } catch (error) {
    console.warn('HR final fallback:', error.message);
  }

  const evaluations = session.answers.map((answer) => answer.evaluation?.overall || 65);
  const avg = evaluations.length ? Math.round(evaluations.reduce((sum, score) => sum + score, 0) / evaluations.length) : 65;
  return {
    finalScores: {
      communication: avg,
      confidence: avg,
      hrReadiness: avg,
      cultureFit: avg,
      overall: avg,
    },
    finalFeedback: 'You completed the HR round. Improve answer structure, examples, and confidence cues.',
    suggestions: ['Practice STAR format for behavioral questions.', 'Prepare concise examples from your projects.'],
  };
};

module.exports = { generateHRQuestion, evaluateHRAnswer, finalizeHRRound };
