const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const HRRoundSession = require('../models/HRRoundSession');
const { generateHRQuestion, evaluateHRAnswer, finalizeHRRound } = require('../services/hrRoundService');

const router = express.Router();
router.use(authMiddleware);

router.post('/sessions', async (req, res) => {
  const {
    targetRole,
    experienceLevel = 'Fresher',
    companyType = 'Service Company',
    difficulty = 'Intermediate',
    resumeSummary = '',
  } = req.body;

  if (!targetRole?.trim()) {
    return res.status(400).json({ success: false, message: 'Target role is required' });
  }

  const session = await HRRoundSession.create({
    userId: req.user._id,
    targetRole,
    experienceLevel,
    companyType,
    difficulty,
    resumeSummary,
  });

  res.status(201).json({ success: true, session });
});

router.post('/sessions/:id/question', async (req, res) => {
  const session = await HRRoundSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  const question = await generateHRQuestion({ session });
  res.json({ success: true, question });
});

router.post('/sessions/:id/answers', async (req, res) => {
  const session = await HRRoundSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  if (session.status === 'completed') {
    return res.status(400).json({ success: false, message: 'Session is already completed' });
  }

  const { question, questionType = 'General', transcript, duration = 0, speechMetrics = {} } = req.body;
  if (!question || !transcript?.trim()) {
    return res.status(400).json({ success: false, message: 'Question and transcript are required' });
  }

  const evaluation = await evaluateHRAnswer({ question, transcript, speechMetrics });
  session.answers.push({
    question,
    questionType,
    transcript,
    duration,
    speechMetrics,
    evaluation,
  });
  await session.save();

  res.status(201).json({ success: true, session, evaluation });
});

router.post('/sessions/:id/end', async (req, res) => {
  const session = await HRRoundSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

  const final = await finalizeHRRound({ session });
  session.finalScores = final.finalScores;
  session.finalFeedback = final.finalFeedback;
  session.suggestions = final.suggestions || [];
  session.status = 'completed';
  await session.save();

  res.json({ success: true, session });
});

router.get('/history', async (req, res) => {
  const sessions = await HRRoundSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, sessions });
});

router.get('/sessions/:id', async (req, res) => {
  const session = await HRRoundSession.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  res.json({ success: true, session });
});

module.exports = router;
