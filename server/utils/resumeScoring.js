const ACTION_VERBS = ['built', 'developed', 'designed', 'implemented', 'optimized', 'led', 'created', 'improved', 'delivered', 'automated'];
const SECTION_PATTERNS = {
  summary: /\b(summary|objective|profile)\b/i,
  skills: /\bskills?\b/i,
  education: /\beducation\b/i,
  projects: /\bprojects?\b/i,
  experience: /\b(experience|internship|work history)\b/i,
  certifications: /\b(certifications?|licenses?)\b/i,
  achievements: /\b(achievements?|awards?)\b/i,
};

const STOPWORDS = new Set(['the', 'and', 'with', 'for', 'from', 'that', 'this', 'will', 'your', 'you', 'are', 'have', 'has', 'our', 'job', 'role']);

const extractKeywords = (text = '') =>
  [...new Set(
    text
      .toLowerCase()
      .match(/[a-z][a-z+#.]{2,}/g)
      ?.filter((word) => !STOPWORDS.has(word)) || []
  )].slice(0, 40);

const hasContactInfo = (text) => ({
  email: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/.test(text),
  phone: /(\+?\d[\d\s()-]{8,}\d)/.test(text),
  linkedin: /linkedin\.com/i.test(text),
  github: /github\.com/i.test(text),
});

const scoreResume = ({ resumeText, jobDescription = '' }) => {
  const lower = resumeText.toLowerCase();
  const contact = hasContactInfo(resumeText);
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  const matchedKeywords = jobKeywords.filter((word) => lower.includes(word));
  const missingKeywords = jobKeywords.filter((word) => !lower.includes(word));
  const actionVerbCount = ACTION_VERBS.filter((verb) => lower.includes(verb)).length;

  const checks = {
    contactDetails: Object.values(contact).filter(Boolean).length >= 2,
    summaryObjective: SECTION_PATTERNS.summary.test(resumeText),
    skills: SECTION_PATTERNS.skills.test(resumeText),
    education: SECTION_PATTERNS.education.test(resumeText),
    projects: SECTION_PATTERNS.projects.test(resumeText),
    internshipExperience: SECTION_PATTERNS.experience.test(resumeText),
    certifications: SECTION_PATTERNS.certifications.test(resumeText),
    achievements: SECTION_PATTERNS.achievements.test(resumeText),
    keywords: matchedKeywords.length > 0,
    grammar: resumeText.split(/[.!?]/).filter(Boolean).length > 2,
    formatting: resumeText.length > 250 && resumeText.length < 10000,
    actionVerbs: actionVerbCount >= 3,
    jobRoleMatching: jobDescription ? matchedKeywords.length / Math.max(jobKeywords.length, 1) >= 0.3 : false,
  };

  const sectionScores = {
    contactInfo: Math.min(10, Object.values(contact).filter(Boolean).length * 3),
    skillsMatch: Math.min(20, checks.skills ? 8 + matchedKeywords.length * 2 : matchedKeywords.length * 2),
    projectRelevance: Math.min(20, checks.projects ? 10 + matchedKeywords.length : matchedKeywords.length),
    experience: checks.internshipExperience ? 15 : 0,
    education: checks.education ? 10 : 0,
    keywords: Math.min(15, matchedKeywords.length * 2),
    grammarClarity: checks.grammar ? 10 : 5,
  };

  const atsScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0);

  return {
    atsScore,
    sectionScores,
    checks,
    matchedKeywords,
    missingKeywords,
    resumeKeywords,
  };
};

module.exports = { scoreResume, extractKeywords };
