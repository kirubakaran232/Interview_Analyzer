const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('../config/firebase-admin');

// POST /api/auth/verify
// Called after Firebase login — creates user in MongoDB if first time
router.post('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authentication token provided' });
  }

  const decoded = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
  const firebaseUid = decoded.uid;
  const email = decoded.email;
  const displayName = decoded.name || req.body.displayName || '';
  const photoURL = decoded.picture || req.body.photoURL || '';

  if (!email) {
    return res.status(400).json({ success: false, message: 'Verified Firebase user has no email' });
  }

  // Upsert user (create if doesn't exist, update if exists)
  const user = await User.findOneAndUpdate(
    { firebaseUid },
    {
      $setOnInsert: { email, createdAt: new Date() },
      $set: { displayName, photoURL },
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.json({ success: true, user });
});

module.exports = router;
