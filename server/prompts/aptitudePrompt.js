const buildAptitudeQuestionPrompt = ({ category, topic, difficulty, userLevel, performanceData, previousQuestions = [] }) => `You are an aptitude trainer for placement preparation.

Generate one aptitude question based on:

Category: ${category}
Topic: ${topic}
Difficulty: ${difficulty}
User level: ${userLevel}
Previous performance: ${JSON.stringify(performanceData)}

Previous questions to avoid repeating:
${previousQuestions.join(' | ') || 'None'}

Return the response in JSON format:
{
  "question": "",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "",
  "explanation": "",
  "shortcutMethod": "",
  "concept": "",
  "difficulty": "",
  "estimatedTime": "",
  "similarPracticeSuggestion": ""
}

Rules:
- Question should be original.
- Do not repeat previous questions.
- Explanation should be simple.
- Shortcut method should be useful for placement exams.
- Difficulty should match the user level.`;

module.exports = { buildAptitudeQuestionPrompt };
