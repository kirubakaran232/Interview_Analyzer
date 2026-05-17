const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const CodingSession = require('../models/CodingSession');
const CodingProgress = require('../models/CodingProgress');
const roadmap = require('../data/dsaRoadmap');
const {
  generateCodingQuestion,
  generateCodingHint,
  reviewCodingSubmission,
} = require('../services/codingService');

const router = express.Router();
router.use(authMiddleware);

router.post('/sessions', async (req, res) => {
  const { language, level, topic } = req.body;
  const question = await generateCodingQuestion({ language, level, topic });
  const session = await CodingSession.create({
    userId: req.user._id,
    language,
    level,
    topic,
    question,
  });
  res.status(201).json({ success: true, session });
});

router.post('/sessions/:id/hint', async (req, res) => {
  const session = await CodingSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  const hint = await generateCodingHint({
    question: session.question,
    code: req.body.code || session.code,
    hintNumber: session.hints.length + 1,
  });
  session.hints.push(hint);
  session.code = req.body.code || session.code;
  await session.save();
  res.json({ success: true, hint, hints: session.hints });
});

router.post('/sessions/:id/submit', async (req, res) => {
  const session = await CodingSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  session.code = req.body.code || '';
  session.feedback = await reviewCodingSubmission({
    question: session.question,
    code: session.code,
    language: session.language,
  });
  session.status = 'submitted';
  await session.save();
  res.json({ success: true, session });
});

router.get('/sessions/history', async (req, res) => {
  const sessions = await CodingSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, sessions });
});

router.get('/roadmap', async (req, res) => {
  const progress = await CodingProgress.find({ userId: req.user._id }).lean();
  const progressMap = new Map(progress.map((item) => [item.problemId, item.status]));
  res.json({
    success: true,
    roadmap: roadmap.map((problem) => ({
      ...problem,
      status: progressMap.get(problem.id) || problem.status,
    })),
  });
});

router.put('/roadmap/:problemId', async (req, res) => {
  const status = req.body.status;
  if (!['Not Started', 'Solved', 'Revisit'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  const progress = await CodingProgress.findOneAndUpdate(
    { userId: req.user._id, problemId: req.params.problemId },
    { status },
    { upsert: true, new: true }
  );
  res.json({ success: true, progress });
});

router.get('/daily-plan', async (req, res) => {
  const progress = await CodingProgress.find({ userId: req.user._id }).lean();
  const solved = new Set(progress.filter((item) => item.status === 'Solved').map((item) => item.problemId));
  const nextProblems = roadmap.filter((problem) => !solved.has(problem.id)).slice(0, 5);
  res.json({
    success: true,
    plan: nextProblems.map((problem, index) => ({
      daySlot: index + 1,
      ...problem,
    })),
  });
});

module.exports = router;
