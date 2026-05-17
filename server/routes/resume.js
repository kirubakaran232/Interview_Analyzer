const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { extractResumeText, analyzeResume } = require('../services/resumeService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authMiddleware);

router.post('/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Resume file is required' });
  }

  const resumeText = await extractResumeText(req.file);
  if (!resumeText.trim()) {
    return res.status(400).json({ success: false, message: 'Could not extract resume text' });
  }

  const jobDescription = req.body.jobDescription || '';
  const report = await analyzeResume({ resumeText, jobDescription });
  const analysis = await ResumeAnalysis.create({
    userId: req.user._id,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    resumeText,
    jobDescription,
    ...report,
  });

  res.status(201).json({ success: true, analysis });
});

router.get('/history', async (req, res) => {
  const analyses = await ResumeAnalysis.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('-resumeText')
    .lean();
  res.json({ success: true, analyses });
});

router.get('/:id', async (req, res) => {
  const analysis = await ResumeAnalysis.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
  res.json({ success: true, analysis });
});

module.exports = router;
