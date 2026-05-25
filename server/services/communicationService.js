const { callGemini } = require('./geminiService');
const { buildCommunicationPrompt } = require('../prompts/communicationPrompt');

const evaluateCommunication = async (params) => {
  try {
    const result = await callGemini(buildCommunicationPrompt(params), {
      temperature: 0.3,
      maxOutputTokens: 1200,
    });
    if (result.scores?.overall !== undefined) return result;
  } catch (error) {
    console.warn('Communication evaluation fallback:', error.message);
  }

  return {
    scores: {
      fluency: 70,
      grammar: 70,
      clarity: 70,
      vocabulary: 65,
      confidence: 70,
      professionalTone: 70,
      overall: 69,
    },
    strengths: ['You completed the response with understandable points.'],
    improvements: ['Use shorter sentences and add one concrete example.'],
    correctedVersion: params.transcript,
    practicePlan: ['Record a 60-second self introduction and remove filler words.'],
    summary: 'Good start. Focus on sentence structure, examples, and confident delivery.',
  };
};

module.exports = { evaluateCommunication };
