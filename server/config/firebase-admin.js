// ── Firebase Admin Initialization ─────────────────────────────
// Uses environment variables to avoid storing serviceAccount.json in repo.
// Set the FIREBASE_SERVICE_ACCOUNT env variable to the full JSON string,
// OR set individual FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY vars.

const admin = require('firebase-admin');

if (!admin.apps.length) {
  // Option A: Full service account JSON string in env
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  // Option B: Individual env vars (easier for Render deployment)
  else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key in env has literal \n — convert to actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  // Option C: Local development — use serviceAccount.json file
  else {
    try {
      const serviceAccount = require('./serviceAccount.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch {
      console.warn('⚠️  Firebase Admin not initialized. Set FIREBASE_PROJECT_ID env vars.');
    }
  }
}

module.exports = admin;
