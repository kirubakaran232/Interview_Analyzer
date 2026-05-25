const { callGemini } = require('./geminiService');
const { buildGDTurnPrompt, buildGDEvaluationPrompt } = require('../prompts/groupDiscussionPrompt');

const generateParticipantTurn = async ({ topic, difficulty, turns, participants }) => {
  try {
    const result = await callGemini(buildGDTurnPrompt({ topic, difficulty, turns, participants }), {
      temperature: 0.8,
      maxOutputTokens: 400,
    });
    if (result.speaker && result.message) return result;
  } catch (error) {
    console.warn('GD participant fallback:', error.message);
  }

  return {
    speaker: participants[turns.length % participants.length],
    message: `I would like to add that ${topic.toLowerCase()} should be discussed with both benefits and practical challenges in mind.`,
  };
};

const evaluateGD = async ({ topic, turns }) => {
  try {
    const result = await callGemini(buildGDEvaluationPrompt({ topic, turns }), {
      temperature: 0.3,
      maxOutputTokens: 900,
    });
    if (result.scores?.overall !== undefined) return result;
  } catch (error) {
    console.warn('GD evaluation fallback:', error.message);
  }

  return {
    scores: {
      content: 70,
      communication: 70,
      leadership: 65,
      initiative: 65,
      listening: 70,
      overall: 68,
    },
    strengths: ['You participated with relevant points.'],
    improvements: ['Add examples and invite other participants to contribute.'],
    summary: 'You gave a reasonable GD performance. Improve structure, evidence, and leadership cues.',
  };
};

module.exports = { generateParticipantTurn, evaluateGD };
