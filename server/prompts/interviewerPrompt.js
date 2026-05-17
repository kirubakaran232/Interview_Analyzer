// ─────────────────────────────────────────────────────────────────
// Gemini API Prompts for Interview Generation and Evaluation
// ─────────────────────────────────────────────────────────────────

/**
 * Build the dynamic interviewer prompt.
 * The AI should behave like a real HR/Technical interviewer.
 */
const buildInterviewerPrompt = ({ domain, skills, resumeSummary, previousQA, difficulty, questionNumber }) => {
  const previousContext = previousQA?.length
    ? previousQA.map((qa, i) => `Q${i + 1}: ${qa.q}\nCandidate's Answer: ${qa.a || '(No answer provided)'}`).join('\n\n')
    : 'This is the first question.';

  const difficultyGuide = {
    beginner: 'Ask simple, conceptual questions suitable for a fresh graduate or college student.',
    intermediate: 'Ask moderately challenging questions for someone with 1-3 years of experience.',
    advanced: 'Ask in-depth, scenario-based questions for senior-level candidates.',
  };

  return `You are an expert interviewer for the domain: "${domain}".
You are conducting a real, professional HR + Technical interview.
The candidate has the following skills: ${skills.join(', ')}.
${resumeSummary ? `\nCandidate's background/project summary:\n${resumeSummary}\n` : ''}

Difficulty level: ${difficulty}
${difficultyGuide[difficulty] || ''}

Previous conversation:
${previousContext}

You are now asking question number ${questionNumber}.

RULES:
- Question 1: Always ask for a brief self-introduction
- Question 2: Ask about their main project or recent work
- Questions 3-5: Ask technical questions based on their skills and previous answers
- Questions 6-8: Ask HR/behavioral questions (teamwork, challenges, strengths, goals)
- For follow-up questions: Dig deeper into what the candidate just said
- Sound conversational and natural, like a real interviewer
- Do NOT explain or preface the question
- Do NOT say "Great answer!" or give feedback in this prompt
- Ask ONE question only

IMPORTANT: Respond in this exact JSON format only, with no extra text:
{"question": "Your question here", "type": "HR|Technical|Follow-up|Introduction"}`;
};

/**
 * Build the answer evaluator prompt.
 * Returns structured JSON with scores and suggestions.
 */
const buildEvaluatorPrompt = ({ questionText, transcript, domain, fillerCount, wpm, duration }) => {
  const speedLabel = wpm < 80 ? 'very slow' : wpm < 120 ? 'slow' : wpm <= 160 ? 'good pace' : 'too fast';

  return `You are an expert interview coach and communication specialist.

Evaluate the following interview answer:

QUESTION ASKED: "${questionText}"
DOMAIN: ${domain}
CANDIDATE'S ANSWER (transcript): "${transcript || '(No answer — candidate stayed silent)'}"
SPEAKING SPEED: ${wpm} WPM (${speedLabel})
FILLER WORDS DETECTED: ${fillerCount} (um, uh, like, basically, etc.)
ANSWER DURATION: ${duration} seconds

Evaluate across these dimensions:
1. Answer Relevance: How well does the answer address the question? (0-100)
2. Grammar Score: Quality of English grammar and sentence structure. (0-100)
3. Clarity Score: How clear and easy to understand is the answer? (0-100)
4. Technical Accuracy: If it's a technical question, is the content correct? (0-100 — give 70 for non-technical questions)

Also provide:
- 2-4 specific, actionable improvement suggestions
- Any notable grammar issues
- One overall commentary paragraph (2-3 sentences)

IMPORTANT: Respond in this exact JSON format only, with no extra text:
{
  "answerRelevance": 0-100,
  "grammarScore": 0-100,
  "clarityScore": 0-100,
  "technicalAccuracy": 0-100,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "grammarIssues": ["issue1"],
  "overallCommentary": "Your feedback here."
}`;
};

module.exports = { buildInterviewerPrompt, buildEvaluatorPrompt };
