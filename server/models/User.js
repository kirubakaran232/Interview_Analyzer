const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  displayName: {
    type: String,
    default: '',
    trim: true,
  },
  photoURL: {
    type: String,
    default: '',
  },
  domain: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  resumeText: {
    type: String,
    default: '',
    maxlength: 10000,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
