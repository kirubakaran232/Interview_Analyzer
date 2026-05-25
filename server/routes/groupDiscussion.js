const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const GroupDiscussionSession = require('../models/GroupDiscussionSession');
const { generateParticipantTurn, evaluateGD } = require('../services/groupDiscussionService');

const router = express.Router();
router.use(authMiddleware);

router.post('/sessions', async (req, res) => {
  const {
    topic,
    category = 'General',
    difficulty = 'Intermediate',
    durationMinutes = 10,
  } = req.body;

  if (!topic?.trim()) {
    return res.status(400).json({ success: false, message: 'Topic is required' });
  }

  const session = await GroupDiscussionSession.create({
    userId: req.user._id,
    topic,
    category,
    difficulty,
    durationMinutes,
    turns: [{
      speaker: 'Moderator',
      role: 'moderator',
      message: `Welcome everyone. Today we will discuss: ${topic}. Please keep your points concise and respectful.`,
    }],
  });

  res.status(201).json({ success: true, session });
});

router.post('/sessions/:id/turns', async (req, res) => {
  const session = await GroupDiscussionSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  if (session.status === 'completed') {
    return res.status(400).json({ success: false, message: 'Session is already completed' });
  }

  const message = req.body.message?.trim();
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  session.turns.push({ speaker: req.user.displayName || 'You', role: 'candidate', message });
  const aiTurn = await generateParticipantTurn({
    topic: session.topic,
    difficulty: session.difficulty,
    turns: session.turns,
    participants: session.participants,
  });
  session.turns.push({ speaker: aiTurn.speaker, role: 'ai-participant', message: aiTurn.message });
  await session.save();

  res.json({ success: true, session, aiTurn });
});

router.post('/sessions/:id/end', async (req, res) => {
  const session = await GroupDiscussionSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

  const evaluation = await evaluateGD({ topic: session.topic, turns: session.turns });
  session.scores = evaluation.scores;
  session.strengths = evaluation.strengths || [];
  session.improvements = evaluation.improvements || [];
  session.summary = evaluation.summary || '';
  session.status = 'completed';
  await session.save();

  res.json({ success: true, session });
});

router.get('/history', async (req, res) => {
  const sessions = await GroupDiscussionSession.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, sessions });
});

router.get('/sessions/:id', async (req, res) => {
  const session = await GroupDiscussionSession.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  res.json({ success: true, session });
});

module.exports = router;
