const buildCommunicationPrompt = ({ mode, prompt, transcript, speechMetrics }) => `You are an English communication trainer for placement preparation.

Practice mode: ${mode}
Prompt given to candidate: ${prompt}

Candidate transcript:
${transcript}

Speech metrics:
${JSON.stringify(speechMetrics)}

Evaluate the candidate for interview communication.
Return only JSON:
{
  "scores": {
    "fluency": 0,
    "grammar": 0,
    "clarity": 0,
    "vocabulary": 0,
    "confidence": 0,
    "professionalTone": 0,
    "overall": 0
  },
  "strengths": ["specific strength"],
  "improvements": ["specific improvement"],
  "correctedVersion": "improved version of the candidate answer in natural professional English",
  "practicePlan": ["short daily practice task"],
  "summary": "short coaching summary"
}`;

module.exports = { buildCommunicationPrompt };
