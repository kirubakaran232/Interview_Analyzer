const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const InterviewSession = require('../models/InterviewSession');
const { generateInterviewQuestion } = require('../services/geminiService');

const router = express.Router();
router.use(authMiddleware);

router.post('/generate', async (req, res) => {
  const { sessionId, domain, skills = [], difficulty, resumeText, previousQA = [], questionNumber } = req.body;
  const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const question = await generateInterviewQuestion({
    domain: domain || session.domain,
    skills: skills.length ? skills : session.skills,
    difficulty: difficulty || session.difficulty,
    resumeSummary: resumeText || session.resumeText,
    previousQA,
    questionNumber,
  });

  res.json({ success: true, ...question });
});

module.exports = router;
