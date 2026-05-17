const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

const callGemini = async (prompt, options = {}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.8,
          topK: options.topK ?? 40,
          topP: options.topP ?? 0.95,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${detail}`);
  }

  const result = await response.json();
  const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleaned = responseText
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.warn('Gemini response was not valid JSON:', cleaned.substring(0, 200));
    return { raw: cleaned };
  }
};

const generateInterviewQuestion = async (params) => {
  const { buildInterviewerPrompt } = require('../prompts/interviewerPrompt');
  const prompt = buildInterviewerPrompt(params);
  const result = await callGemini(prompt, { temperature: 0.9 });

  if (result.question) return result;

  return {
    question: `Can you tell me more about your experience with ${params.skills[0] || params.domain}?`,
    type: 'Technical',
  };
};

const evaluateAnswer = async (params) => {
  const { buildEvaluatorPrompt } = require('../prompts/interviewerPrompt');
  const prompt = buildEvaluatorPrompt(params);
  const result = await callGemini(prompt, { temperature: 0.5 });

  if (typeof result.answerRelevance === 'number') return result;

  return {
    answerRelevance: 70,
    grammarScore: 70,
    clarityScore: 70,
    technicalAccuracy: 70,
    suggestions: [
      'Give one concrete example from your own experience.',
      'Pause briefly instead of using filler words.',
      'Keep answers structured with a clear beginning, middle, and end.',
    ],
    grammarIssues: [],
    overallCommentary: 'You answered the question adequately. Add more detail and structure to sound stronger.',
  };
};

module.exports = { callGemini, generateInterviewQuestion, evaluateAnswer };
