const buildCodingQuestionPrompt = ({ language, level, topic }) => `You are a coding interviewer.

Create one ${level} ${topic} interview problem for a candidate coding in ${language}.
Do not use the exact title of a famous LeetCode problem.

Return only JSON:
{
  "title": "problem title",
  "prompt": "clear problem statement",
  "examples": ["example 1", "example 2"],
  "constraints": ["constraint"],
  "expectedPattern": "pattern",
  "difficulty": "${level}"
}`;

const buildCodingHintPrompt = ({ question, code, hintNumber }) => `You are a coding interviewer.

Question:
${JSON.stringify(question)}

Candidate code so far:
${code || '(empty)'}

Give hint number ${hintNumber}. Do not give the full answer or final code.
Return only JSON:
{"hint":"one concise progressive hint"}`;

const buildCodingFeedbackPrompt = ({ question, code, language }) => `You are a senior coding interviewer.

Review this ${language} submission.

QUESTION:
${JSON.stringify(question)}

CODE:
${code}

Return only JSON:
{
  "logicScore": 0,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "edgeCases": ["case"],
  "readabilityScore": 0,
  "strengths": ["strength"],
  "issues": ["issue"],
  "nextHint": "guidance without full solution",
  "verdict": "short verdict"
}`;

module.exports = {
  buildCodingQuestionPrompt,
  buildCodingHintPrompt,
  buildCodingFeedbackPrompt,
};
