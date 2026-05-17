const { callGemini } = require('./geminiService');
const {
  buildCodingQuestionPrompt,
  buildCodingHintPrompt,
  buildCodingFeedbackPrompt,
} = require('../prompts/codingPrompt');

const generateCodingQuestion = async (params) => {
  const result = await callGemini(buildCodingQuestionPrompt(params), { temperature: 0.8 });
  return result.title ? result : {
    title: `${params.topic} Practice`,
    prompt: `Solve a ${params.level} ${params.topic} problem in ${params.language}.`,
    examples: [],
    constraints: [],
    expectedPattern: params.topic,
    difficulty: params.level,
  };
};

const generateCodingHint = async (params) => {
  const result = await callGemini(buildCodingHintPrompt(params), { temperature: 0.5 });
  return result.hint || 'Think about the core pattern before coding the final implementation.';
};

const reviewCodingSubmission = async (params) => {
  const result = await callGemini(buildCodingFeedbackPrompt(params), { temperature: 0.3 });
  return result.logicScore !== undefined ? result : {
    logicScore: 70,
    timeComplexity: 'Needs review',
    spaceComplexity: 'Needs review',
    edgeCases: ['Empty input', 'Single element input'],
    readabilityScore: 70,
    strengths: ['Submitted a complete attempt'],
    issues: ['Add more edge-case handling'],
    nextHint: 'Walk through the smallest non-trivial example by hand.',
    verdict: 'Solid first attempt.',
  };
};

module.exports = {
  generateCodingQuestion,
  generateCodingHint,
  reviewCodingSubmission,
};
