import { scoreWPM } from './fillerWordDetector';

/**
 * ─────────────────────────────────────────────────────────────────
 * Scoring Engine
 * Computes all 5 interview dimension scores from raw data.
 * ─────────────────────────────────────────────────────────────────
 *
 * Inputs:
 *   - blFrames: Array of MediaPipe frame metrics (body language)
 *   - speechData: { fillerCount, wpm, wordCount }
 *   - aiEval: { answerRelevance, grammarScore, clarityScore, technicalAccuracy }
 *   - questionCount: number of questions answered
 *
 * Returns: { communication, confidence, bodyLanguage, technicalExplanation, hrReadiness, overall }
 */

/**
 * Average an array of body language frame metrics.
 */
export const averageFrames = (frames) => {
  if (!frames || frames.length === 0) {
    return {
      eyeContact: 50,
      postureScore: 50,
      shoulderLevel: 50,
      expressionConfidence: 50,
      mouthOpenness: 10,
    };
  }
  const sum = frames.reduce(
    (acc, f) => ({
      eyeContact: acc.eyeContact + (f.eyeContact || 0),
      postureScore: acc.postureScore + (f.postureScore || 0),
      shoulderLevel: acc.shoulderLevel + (f.shoulderLevel || 0),
      expressionConfidence: acc.expressionConfidence + (f.expressionConfidence || 0),
      mouthOpenness: acc.mouthOpenness + (f.mouthOpenness || 0),
    }),
    { eyeContact: 0, postureScore: 0, shoulderLevel: 0, expressionConfidence: 0, mouthOpenness: 0 }
  );
  const n = frames.length;
  return {
    eyeContact: sum.eyeContact / n,
    postureScore: sum.postureScore / n,
    shoulderLevel: sum.shoulderLevel / n,
    expressionConfidence: sum.expressionConfidence / n,
    mouthOpenness: sum.mouthOpenness / n,
  };
};

/**
 * Compute filler word penalty score (0–100).
 * Each filler word reduces score by 5, floored at 0.
 */
const fillerPenaltyScore = (fillerCount) =>
  Math.max(0, 100 - fillerCount * 5);

/**
 * Main scoring function.
 */
export const computeScores = ({ blFrames = [], speechData = {}, aiEval = {}, questionCount = 1 }) => {
  const bl = averageFrames(blFrames);
  const { fillerCount = 0, wpm = 130 } = speechData;
  const {
    answerRelevance = 70,
    grammarScore = 70,
    clarityScore = 70,
    technicalAccuracy = 70,
  } = aiEval;

  // ── Body Language Score (0–100) ───────────────────────────
  const bodyLanguage = Math.round(
    bl.eyeContact * 0.40 +
    bl.postureScore * 0.30 +
    bl.shoulderLevel * 0.15 +
    bl.expressionConfidence * 0.15
  );

  // ── Communication Score (0–100) ───────────────────────────
  const speedScore = scoreWPM(wpm);
  const fillerScore = fillerPenaltyScore(fillerCount);
  const communication = Math.round(
    grammarScore * 0.30 +
    clarityScore * 0.30 +
    fillerScore * 0.20 +
    speedScore * 0.20
  );

  // ── Confidence Score (0–100) ──────────────────────────────
  const confidence = Math.round(
    bl.eyeContact * 0.35 +
    bl.postureScore * 0.25 +
    fillerScore * 0.20 +
    bl.expressionConfidence * 0.20
  );

  // ── Technical Explanation Score (0–100) ───────────────────
  const technicalExplanation = Math.round(
    answerRelevance * 0.50 +
    technicalAccuracy * 0.50
  );

  // ── HR Readiness Score (0–100) ────────────────────────────
  const hrReadiness = Math.round(
    communication * 0.40 +
    confidence * 0.35 +
    answerRelevance * 0.25
  );

  // ── Overall Score (weighted average) ──────────────────────
  const overall = Math.round(
    communication * 0.25 +
    confidence * 0.20 +
    bodyLanguage * 0.20 +
    technicalExplanation * 0.20 +
    hrReadiness * 0.15
  );

  return {
    communication: clamp(communication),
    confidence: clamp(confidence),
    bodyLanguage: clamp(bodyLanguage),
    technicalExplanation: clamp(technicalExplanation),
    hrReadiness: clamp(hrReadiness),
    overall: clamp(overall),
  };
};

const clamp = (v) => Math.min(100, Math.max(0, v));

/**
 * Get a letter grade for a score.
 */
export const getGrade = (score) => {
  if (score >= 90) return { grade: 'A+', label: 'Exceptional', color: '#22C55E' };
  if (score >= 80) return { grade: 'A', label: 'Excellent', color: '#86EFAC' };
  if (score >= 70) return { grade: 'B', label: 'Good', color: '#00D4FF' };
  if (score >= 60) return { grade: 'C', label: 'Average', color: '#F59E0B' };
  if (score >= 50) return { grade: 'D', label: 'Below Average', color: '#F97316' };
  return { grade: 'F', label: 'Needs Work', color: '#EF4444' };
};

/**
 * Get color for a score value.
 */
export const getScoreColor = (score) => {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#00D4FF';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
};
