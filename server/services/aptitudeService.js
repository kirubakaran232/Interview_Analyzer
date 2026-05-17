const { callGemini } = require('./geminiService');
const { buildAptitudeQuestionPrompt } = require('../prompts/aptitudePrompt');
const aptitudeCatalog = require('../data/aptitudeCatalog');

const generateAptitudeQuestion = async (params) => {
  const result = await callGemini(buildAptitudeQuestionPrompt(params), {
    temperature: 0.8,
    maxOutputTokens: 900,
  });

  if (result.question && Array.isArray(result.options)) return result;

  return {
    question: `Which option best matches the concept of ${params.topic}?`,
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: `This is a fallback ${params.topic} practice question.`,
    shortcutMethod: 'Review the core formula before attempting similar questions.',
    concept: params.topic,
    difficulty: params.difficulty,
    estimatedTime: '60 seconds',
    similarPracticeSuggestion: `Practice more ${params.topic} problems.`,
  };
};

const summarizeAttempts = (attempts = []) => {
  const totalQuestions = attempts.length;
  const correctAnswers = attempts.filter((attempt) => attempt.isCorrect).length;
  const wrongAnswers = totalQuestions - correctAnswers;
  const accuracy = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const averageTimePerQuestion = totalQuestions
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.timeTakenSeconds, 0) / totalQuestions)
    : 0;

  const topicMap = attempts.reduce((acc, attempt) => {
    acc[attempt.topic] ||= { total: 0, correct: 0 };
    acc[attempt.topic].total += 1;
    if (attempt.isCorrect) acc[attempt.topic].correct += 1;
    return acc;
  }, {});

  const topicStats = Object.entries(topicMap).map(([topic, stats]) => ({
    topic,
    total: stats.total,
    correct: stats.correct,
    accuracy: Math.round((stats.correct / stats.total) * 100),
  }));

  const weakTopics = topicStats.filter((item) => item.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
  const strongTopics = topicStats.filter((item) => item.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy);

  const suggestions = [];
  if (weakTopics[0]) suggestions.push(`You are weak in ${weakTopics[0].topic}.`);
  if (weakTopics[1]) suggestions.push(`Practice more ${weakTopics[1].topic} problems.`);
  if (averageTimePerQuestion <= 60 && accuracy < 70) suggestions.push('Your speed is good but accuracy should improve.');
  if (averageTimePerQuestion > 90) suggestions.push('Work on shortcuts to improve speed.');
  if (!suggestions.length && totalQuestions) suggestions.push('Your performance is balanced. Keep practicing mixed sets.');

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    accuracy,
    averageTimePerQuestion,
    weakTopics,
    strongTopics,
    topicStats,
    suggestions,
  };
};

const getMixedTopics = () =>
  Object.values(aptitudeCatalog).flat().filter((topic, index, array) => array.indexOf(topic) === index);

module.exports = {
  generateAptitudeQuestion,
  summarizeAttempts,
  getMixedTopics,
};
