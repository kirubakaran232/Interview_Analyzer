const admin = require('../config/firebase-admin');
const User = require('../models/User');

/**
 * Middleware: Verify Firebase ID token from Authorization header.
 * Attaches req.user (MongoDB user doc) and req.firebaseUser to request.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authentication token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decodedToken;

    // Find or fail — user must exist in MongoDB (created on login)
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    const message = err.code === 'auth/id-token-expired'
      ? 'Session expired. Please log in again.'
      : 'Invalid authentication token';
    return res.status(401).json({ success: false, message });
  }
};

module.exports = authMiddleware;
