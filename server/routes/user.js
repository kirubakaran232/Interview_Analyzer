const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', async (req, res) => {
  const { displayName, domain, skills, resumeText } = req.body;
  req.user.displayName = displayName ?? req.user.displayName;
  req.user.domain = domain ?? req.user.domain;
  req.user.skills = Array.isArray(skills) ? skills.slice(0, 20) : req.user.skills;
  req.user.resumeText = resumeText ?? req.user.resumeText;
  await req.user.save();
  res.json({ success: true, user: req.user });
});

module.exports = router;
