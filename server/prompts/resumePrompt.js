const buildResumeFeedbackPrompt = ({ resumeText, jobDescription, heuristic }) => `You are an ATS resume reviewer.

Review this resume for the target job description. Use the provided heuristic scores as one input, but add practical feedback.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription || 'No job description provided.'}

HEURISTIC ANALYSIS:
${JSON.stringify(heuristic)}

Return only JSON:
{
  "summary": "short review",
  "missingSkills": ["skill"],
  "missingKeywords": ["keyword"],
  "improvedBullets": ["rewritten impact-focused bullet"],
  "suggestions": ["specific suggestion"],
  "grammarClarityScore": 0,
  "jobRoleMatchScore": 0
}`;

module.exports = { buildResumeFeedbackPrompt };
