const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const InterviewSession = require('../models/InterviewSession');
const { evaluateAnswer } = require('../services/geminiService');

const router = express.Router();
router.use(authMiddleware);

router.post('/answer', async (req, res) => {
  const {
    sessionId,
    questionIndex,
    questionText,
    transcript,
    domain,
    fillerCount = 0,
    wpm = 0,
    duration = 0,
  } = req.body;

  const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const evaluation = await evaluateAnswer({
    questionText,
    transcript,
    domain: domain || session.domain,
    fillerCount,
    wpm,
    duration,
  });

  if (typeof questionIndex === 'number' && session.questions[questionIndex]) {
    session.questions[questionIndex].aiEvaluation = evaluation;
    await session.save();
  }

  res.json({ success: true, evaluation });
});

router.get('/:sessionId', async (req, res) => {
  const session = await InterviewSession.findOne({
    _id: req.params.sessionId,
    userId: req.user._id,
  }).lean();
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  res.json({
    success: true,
    evaluations: session.questions.map((question) => question.aiEvaluation || {}),
  });
});

module.exports = router;
