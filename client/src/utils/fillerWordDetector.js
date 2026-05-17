// ─────────────────────────────────────────────────────────────────
// Filler Word Detector
// Detects common filler words in English speech transcripts.
// ─────────────────────────────────────────────────────────────────

const FILLER_WORDS = [
  'um', 'uh', 'ah', 'er', 'hmm',
  'like', 'basically', 'literally',
  'you know', 'i mean', 'sort of', 'kind of',
  'so yeah', 'right', 'okay so',
  'actually', 'honestly', 'basically',
  'and stuff', 'or something',
];

/**
 * Count filler word occurrences in a transcript string.
 * @param {string} text - The transcript text
 * @returns {number} - Total filler word count
 */
export const detectFillerWords = (text) => {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let count = 0;
  for (const filler of FILLER_WORDS) {
    // Match whole word/phrase occurrences
    const regex = new RegExp(`\\b${filler}\\b`, 'g');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
};

/**
 * Return a list of detected filler words with their counts.
 * @param {string} text - The transcript text
 * @returns {Array<{word: string, count: number}>}
 */
export const getFillerWordBreakdown = (text) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  const breakdown = [];
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'g');
    const matches = lower.match(regex);
    if (matches?.length) {
      breakdown.push({ word: filler, count: matches.length });
    }
  }
  return breakdown.sort((a, b) => b.count - a.count);
};

/**
 * Count total words in a string.
 * @param {string} text
 * @returns {number}
 */
export const countWords = (text) => {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

/**
 * Score speaking speed.
 * Optimal: 120–160 WPM for interviews
 * @param {number} wpm
 * @returns {number} 0–100
 */
export const scoreWPM = (wpm) => {
  if (wpm === 0) return 0;
  if (wpm >= 120 && wpm <= 160) return 100;
  if (wpm < 60) return Math.max(0, wpm - 30) * 2;
  if (wpm > 200) return Math.max(0, 100 - (wpm - 160) * 1.5);
  if (wpm < 120) return 60 + ((wpm - 60) / 60) * 40;
  return Math.max(0, 100 - (wpm - 160) * 2);
};
