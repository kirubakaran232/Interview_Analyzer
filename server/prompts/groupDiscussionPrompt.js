const buildGDTurnPrompt = ({ topic, difficulty, turns, participants }) => `You are simulating a placement group discussion.

Topic: ${topic}
Difficulty: ${difficulty}
AI participants: ${participants.join(', ')}

Conversation so far:
${turns.map((turn) => `${turn.speaker}: ${turn.message}`).join('\n') || 'No turns yet.'}

Generate the next AI participant response. Make it realistic, concise, and conversational.
The AI participant should either add a new point, politely challenge an idea, ask for clarification, or connect ideas.

Return only JSON:
{
  "speaker": "one of the AI participant names",
  "message": "one natural GD response"
}`;

const buildGDEvaluationPrompt = ({ topic, turns }) => `You are an expert placement group discussion evaluator.

Evaluate the candidate's performance in this GD.

Topic: ${topic}

Full transcript:
${turns.map((turn) => `${turn.speaker} (${turn.role}): ${turn.message}`).join('\n')}

Score the candidate out of 100 in:
- content
- communication
- leadership
- initiative
- listening

Return only JSON:
{
  "scores": {
    "content": 0,
    "communication": 0,
    "leadership": 0,
    "initiative": 0,
    "listening": 0,
    "overall": 0
  },
  "strengths": ["strength"],
  "improvements": ["specific improvement"],
  "summary": "short evaluator summary"
}`;

module.exports = { buildGDTurnPrompt, buildGDEvaluationPrompt };
