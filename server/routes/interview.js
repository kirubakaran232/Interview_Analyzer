const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const InterviewSession = require('../models/InterviewSession');

const router = express.Router();
router.use(authMiddleware);

router.post('/start', async (req, res) => {
  const { domain, skills = [], difficulty = 'intermediate', resumeText = '' } = req.body;
  if (!domain || !Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ success: false, message: 'domain and at least one skill are required' });
  }

  const session = await InterviewSession.create({
    userId: req.user._id,
    domain,
    skills,
    difficulty,
    resumeText,
  });

  res.status(201).json({ success: true, session });
});

router.put('/:id/end', async (req, res) => {
  const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const { questions, scores, suggestions, bodyLanguageData, duration } = req.body;
  session.questions = Array.isArray(questions) ? questions : session.questions;
  session.scores = scores || session.scores;
  session.suggestions = Array.isArray(suggestions) ? suggestions : session.suggestions;
  session.bodyLanguageData = bodyLanguageData || session.bodyLanguageData;
  session.duration = duration ?? session.duration;
  session.status = 'completed';
  await session.save();

  req.user.totalSessions += 1;
  await req.user.save();

  res.json({ success: true, session });
});

router.get('/history', async (req, res) => {
  const sessions = await InterviewSession.find({ userId: req.user._id })
    .sort({ sessionDate: -1 })
    .lean();
  res.json({ success: true, sessions });
});

router.get('/:id', async (req, res) => {
  const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  res.json({ success: true, session });
});

module.exports = router;
