const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const CommunicationSession = require('../models/CommunicationSession');
const { evaluateCommunication } = require('../services/communicationService');

const router = express.Router();
router.use(authMiddleware);

router.get('/prompts', async (req, res) => {
  res.json({
    success: true,
    prompts: {
      'Self Introduction': [
        'Introduce yourself for a software developer interview in 60 seconds.',
        'Tell me about your academic background and career goal.',
      ],
      Storytelling: [
        'Describe a challenge you faced and how you handled it.',
        'Explain a project story from problem to final outcome.',
      ],
      'Professional English': [
        'Explain why you are a good fit for this company.',
        'Describe your strengths using professional language.',
      ],
      'HR Answer': [
        'Why should we hire you?',
        'Tell me about your weakness and how you are improving it.',
      ],
      'Presentation Practice': [
        'Present your final year project to a non-technical panel.',
        'Explain an idea for improving campus placements.',
      ],
    },
  });
});

router.post('/sessions', async (req, res) => {
  const { mode, prompt, transcript, duration = 0, speechMetrics = {} } = req.body;
  if (!mode || !prompt || !transcript?.trim()) {
    return res.status(400).json({ success: false, message: 'mode, prompt, and transcript are required' });
  }

  const evaluation = await evaluateCommunication({ mode, prompt, transcript, speechMetrics });
  const session = await CommunicationSession.create({
    userId: req.user._id,
    mode,
    prompt,
    transcript,
    duration,
    speechMetrics,
    ...evaluation,
  });

  res.status(201).json({ success: true, session });
});

router.get('/history', async (req, res) => {
  const sessions = await CommunicationSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, sessions });
});

router.get('/sessions/:id', async (req, res) => {
  const session = await CommunicationSession.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  res.json({ success: true, session });
});

module.exports = router;
