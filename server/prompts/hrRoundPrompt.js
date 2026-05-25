const buildHRQuestionPrompt = ({ session, previousAnswers }) => `You are a professional HR interviewer for placement preparation.

Candidate target role: ${session.targetRole}
Experience level: ${session.experienceLevel}
Company type: ${session.companyType}
Difficulty: ${session.difficulty}
Resume/project summary: ${session.resumeSummary || 'Not provided'}

Previous Q&A:
${previousAnswers.map((item, index) => `Q${index + 1}: ${item.question}\nA: ${item.transcript || '(no answer)'}`).join('\n\n') || 'No previous answers.'}

Generate one realistic HR interview question. It can be behavioral, situational, culture-fit, motivation, weakness/strength, teamwork, conflict, goals, salary expectation, relocation, or pressure-handling.
If the previous answer has a useful detail, ask a natural follow-up.

Return only JSON:
{
  "question": "",
  "questionType": "Behavioral|Situational|Culture Fit|Motivation|Follow-up|General"
}`;

const buildHREvaluationPrompt = ({ question, transcript, speechMetrics }) => `You are an HR interview evaluator.

Question:
${question}

Candidate answer:
${transcript}

Speech metrics:
${JSON.stringify(speechMetrics)}

Evaluate the answer for placement HR round readiness.
Return only JSON:
{
  "relevance": 0,
  "structure": 0,
  "confidence": 0,
  "professionalism": 0,
  "starMethod": 0,
  "overall": 0,
  "strengths": ["specific strength"],
  "improvements": ["specific improvement"],
  "idealAnswer": "a better sample answer in natural first-person tone",
  "followUpQuestion": "one suitable HR follow-up question"
}`;

const buildHRFinalPrompt = ({ session }) => `You are an HR interview coach.

Review this complete HR round session:
${JSON.stringify(session.answers)}

Return only JSON:
{
  "finalScores": {
    "communication": 0,
    "confidence": 0,
    "hrReadiness": 0,
    "cultureFit": 0,
    "overall": 0
  },
  "finalFeedback": "short final readiness review",
  "suggestions": ["specific next step"]
}`;

module.exports = {
  buildHRQuestionPrompt,
  buildHREvaluationPrompt,
  buildHRFinalPrompt,
};
