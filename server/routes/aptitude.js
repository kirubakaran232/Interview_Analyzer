const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const AptitudeAttempt = require('../models/AptitudeAttempt');
const AptitudeMockTest = require('../models/AptitudeMockTest');
const aptitudeCatalog = require('../data/aptitudeCatalog');
const {
  generateAptitudeQuestion,
  summarizeAttempts,
  getMixedTopics,
} = require('../services/aptitudeService');

const router = express.Router();
router.use(authMiddleware);

router.get('/catalog', async (req, res) => {
  res.json({ success: true, catalog: aptitudeCatalog });
});

router.post('/questions/generate', async (req, res) => {
  const { category, topic, difficulty, userLevel = difficulty } = req.body;
  const attempts = await AptitudeAttempt.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20).lean();
  const performanceData = summarizeAttempts(attempts);
  const previousQuestions = attempts.map((attempt) => attempt.question.question).filter(Boolean);
  const question = await generateAptitudeQuestion({
    category,
    topic,
    difficulty,
    userLevel,
    performanceData,
    previousQuestions,
  });
  res.json({ success: true, question });
});

router.post('/attempts', async (req, res) => {
  const { category, topic, difficulty, question, selectedAnswer, timeTakenSeconds = 0, mode = 'practice', mockTestId = null } = req.body;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const attempt = await AptitudeAttempt.create({
    userId: req.user._id,
    category,
    topic,
    difficulty,
    question,
    selectedAnswer,
    isCorrect,
    timeTakenSeconds,
    mode,
    mockTestId,
  });
  res.status(201).json({ success: true, attempt });
});

router.get('/history', async (req, res) => {
  const attempts = await AptitudeAttempt.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, attempts, summary: summarizeAttempts(attempts) });
});

router.get('/summary', async (req, res) => {
  const attempts = await AptitudeAttempt.find({ userId: req.user._id }).lean();
  res.json({ success: true, summary: summarizeAttempts(attempts) });
});

router.post('/mock-tests', async (req, res) => {
  const difficulty = req.body.difficulty || 'Intermediate';
  const topics = getMixedTopics();
  const questions = [];
  for (let index = 0; index < 30; index += 1) {
    const topic = topics[index % topics.length];
    const category = Object.entries(aptitudeCatalog).find(([, values]) => values.includes(topic))?.[0] || 'Quantitative Aptitude';
    questions.push(await generateAptitudeQuestion({
      category,
      topic,
      difficulty,
      userLevel: difficulty,
      performanceData: {},
      previousQuestions: questions.map((question) => question.question),
    }));
  }

  const mockTest = await AptitudeMockTest.create({
    userId: req.user._id,
    difficulty,
    questions,
  });
  res.status(201).json({ success: true, mockTest });
});

router.post('/mock-tests/:id/submit', async (req, res) => {
  const mockTest = await AptitudeMockTest.findOne({ _id: req.params.id, userId: req.user._id });
  if (!mockTest) return res.status(404).json({ success: false, message: 'Mock test not found' });

  const answers = req.body.answers || [];
  const attempts = answers.map((answer, index) => {
    const question = mockTest.questions[index];
    return {
      userId: req.user._id,
      category: answer.category,
      topic: answer.topic,
      difficulty: mockTest.difficulty,
      question,
      selectedAnswer: answer.selectedAnswer,
      isCorrect: answer.selectedAnswer === question.correctAnswer,
      timeTakenSeconds: answer.timeTakenSeconds || 0,
      mode: 'mock',
      mockTestId: mockTest._id,
    };
  });

  const savedAttempts = await AptitudeAttempt.insertMany(attempts);
  const summary = summarizeAttempts(savedAttempts);
  mockTest.answers = answers;
  mockTest.correctAnswers = summary.correctAnswers;
  mockTest.wrongAnswers = summary.wrongAnswers;
  mockTest.accuracy = summary.accuracy;
  mockTest.averageTimePerQuestion = summary.averageTimePerQuestion;
  mockTest.finalScore = summary.correctAnswers;
  mockTest.rankStylePerformance =
    summary.accuracy >= 85 ? 'Top Performer' :
    summary.accuracy >= 70 ? 'Competitive' :
    summary.accuracy >= 50 ? 'Developing' : 'Needs Practice';
  mockTest.topicWiseAnalysis = summary.topicStats;
  mockTest.suggestions = summary.suggestions;
  mockTest.status = 'completed';
  await mockTest.save();

  res.json({ success: true, mockTest });
});

router.get('/mock-tests/history', async (req, res) => {
  const mockTests = await AptitudeMockTest.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, mockTests });
});

module.exports = router;
