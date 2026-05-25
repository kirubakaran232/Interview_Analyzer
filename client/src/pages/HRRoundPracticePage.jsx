import { useEffect, useRef, useState } from 'react';
import { Brain, Mic, MicOff, Send, Square, History, Trophy, MessageSquare, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  startHRRoundSession,
  generateHRRoundQuestion,
  submitHRRoundAnswer,
  endHRRoundSession,
  getHRRoundHistory,
} from '../services/api';

const roles = ['Software Developer', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'Business Analyst', 'QA Engineer'];
const experienceLevels = ['Fresher', 'Internship', '1-2 Years', '3+ Years'];
const companyTypes = ['Service Company', 'Product Company', 'Startup', 'MNC'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

const HRRoundPracticePage = () => {
  const [setup, setSetup] = useState({
    targetRole: 'Software Developer',
    experienceLevel: 'Fresher',
    companyType: 'Service Company',
    difficulty: 'Intermediate',
    resumeSummary: '',
  });
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(null);

  const {
    transcript,
    interimTranscript,
    fullTranscript,
    isListening,
    fillerCount,
    wpm,
    wordCount,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    getHRRoundHistory().then(({ data }) => setHistory(data.sessions || [])).catch(() => {});
  }, []);

  const startSession = async () => {
    setLoading(true);
    try {
      const { data } = await startHRRoundSession(setup);
      setSession(data.session);
      await nextQuestion(data.session._id);
    } catch {
      toast.error('Could not start HR round');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async (sessionId = session?._id) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { data } = await generateHRRoundQuestion(sessionId);
      setCurrentQuestion(data.question);
      setTypedAnswer('');
      resetTranscript();
    } catch {
      toast.error('Could not generate HR question');
    } finally {
      setLoading(false);
    }
  };

  const startSpeaking = () => {
    startTimeRef.current = Date.now();
    resetTranscript();
    startListening();
  };

  const submitAnswer = async () => {
    const answer = fullTranscript.trim() || typedAnswer.trim();
    if (!answer) return toast.error('Speak or type your answer first');
    if (!session?._id || !currentQuestion?.question) return toast.error('Generate a question first');
    stopListening();
    setSubmitting(true);
    const duration = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    try {
      const { data } = await submitHRRoundAnswer(session._id, {
        question: currentQuestion.question,
        questionType: currentQuestion.questionType,
        transcript: answer,
        duration,
        speechMetrics: { wpm, fillerCount, wordCount },
      });
      setSession(data.session);
      setTypedAnswer('');
      resetTranscript();
      setCurrentQuestion({
        question: data.evaluation.followUpQuestion || 'Can you give another example that supports your answer?',
        questionType: 'Follow-up',
      });
    } catch {
      toast.error('Could not evaluate answer');
    } finally {
      setSubmitting(false);
    }
  };

  const finish = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data } = await endHRRoundSession(session._id);
      setSession(data.session);
      setHistory((items) => [data.session, ...items.filter((item) => item._id !== data.session._id)]);
    } catch {
      toast.error('Could not finish HR round');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-teal-400" /> HR Round Practice
          </h1>
          <p className="text-white/45 mt-2">Practice behavioral, situational, motivation, and culture-fit HR questions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          <div className="space-y-5">
            <div className="glass-card p-5 space-y-4">
              <Select label="Target role" value={setup.targetRole} values={roles} onChange={(targetRole) => setSetup({ ...setup, targetRole })} />
              <Select label="Experience level" value={setup.experienceLevel} values={experienceLevels} onChange={(experienceLevel) => setSetup({ ...setup, experienceLevel })} />
              <Select label="Company type" value={setup.companyType} values={companyTypes} onChange={(companyType) => setSetup({ ...setup, companyType })} />
              <Select label="Difficulty" value={setup.difficulty} values={difficulties} onChange={(difficulty) => setSetup({ ...setup, difficulty })} />
              <textarea
                value={setup.resumeSummary}
                onChange={(event) => setSetup({ ...setup, resumeSummary: event.target.value })}
                rows={4}
                className="input-field resize-none text-sm"
                placeholder="Optional resume/project summary..."
              />
              <button onClick={startSession} disabled={loading} className="btn-primary w-full">
                {loading ? 'Starting...' : 'Start HR Round'}
              </button>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-cyan-400" /> Recent HR rounds
              </h2>
              <div className="space-y-2">
                {history.slice(0, 5).map((item) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      setSession(item);
                      setCurrentQuestion(null);
                      setTypedAnswer('');
                      resetTranscript();
                    }}
                    className="w-full rounded-lg bg-white/[0.03] px-3 py-2 text-left"
                  >
                    <p className="text-white/70 text-sm truncate">{item.targetRole}</p>
                    <p className="text-white/30 text-xs">Overall {item.finalScores?.overall || 0} / {item.status}</p>
                  </button>
                ))}
                {history.length === 0 && <p className="text-white/30 text-sm">No HR rounds yet.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {!session ? (
              <div className="glass-card p-10 text-center text-white/35">Start an HR round to begin.</div>
            ) : (
              <>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-teal-300 text-sm">{session.targetRole} / {session.difficulty}</p>
                      <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-teal-400" /> {currentQuestion?.questionType || 'HR Question'}
                      </h2>
                    </div>
                    {session.status !== 'completed' && (
                      <button onClick={finish} className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-300 flex items-center gap-2">
                        <Square className="w-4 h-4" /> Finish
                      </button>
                    )}
                  </div>

                  <p className="text-white text-lg leading-relaxed mb-5">{currentQuestion?.question || 'Generating question...'}</p>

                  {session.status !== 'completed' && (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <Metric label="WPM" value={wpm} tone="text-amber-400" />
                        <Metric label="Fillers" value={fillerCount} tone="text-green-400" />
                        <Metric label="Words" value={wordCount} tone="text-cyan-400" />
                      </div>
                      {!isSupported && <p className="text-amber-300 text-sm mb-3">Use Chrome or Edge for live speech recognition.</p>}
                      <div className="rounded-xl bg-navy-950/60 border border-white/5 p-4 min-h-32 mb-4">
                        {transcript || interimTranscript ? (
                          <p className="text-white/75">
                            {transcript}
                            {interimTranscript && <span className="text-white/35 italic"> {interimTranscript}</span>}
                          </p>
                        ) : (
                          <p className="text-white/30">Your spoken answer appears here. You can also type below.</p>
                        )}
                      </div>
                      <textarea
                        value={typedAnswer}
                        onChange={(event) => setTypedAnswer(event.target.value)}
                        rows={4}
                        className="input-field resize-none text-sm mb-4"
                        placeholder="Typed fallback answer..."
                      />
                      <div className="flex flex-wrap gap-3">
                        {!isListening ? (
                          <button onClick={startSpeaking} className="btn-secondary flex items-center gap-2">
                            <Mic className="w-4 h-4" /> Start Speaking
                          </button>
                        ) : (
                          <button onClick={stopListening} className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-red-300 flex items-center gap-2">
                            <MicOff className="w-4 h-4" /> Stop
                          </button>
                        )}
                        <button onClick={resetTranscript} className="btn-secondary px-4">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={submitAnswer} disabled={submitting} className="btn-primary flex items-center gap-2">
                          <Send className="w-4 h-4" /> {submitting ? 'Evaluating...' : 'Submit Answer'}
                        </button>
                        <button onClick={() => nextQuestion()} className="btn-secondary">Skip / New Question</button>
                      </div>
                    </>
                  )}
                </div>

                {session.answers?.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-4">Answer Feedback</h3>
                    <div className="space-y-4">
                      {session.answers.slice().reverse().map((answer, index) => (
                        <div key={`${answer.question}-${index}`} className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                          <p className="text-white/80 font-medium">{answer.question}</p>
                          <p className="text-white/45 text-sm mt-2">{answer.transcript}</p>
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
                            {Object.entries(answer.evaluation || {}).filter(([, value]) => typeof value === 'number').map(([key, value]) => (
                              <Metric key={key} label={key} value={value} tone="text-teal-300" />
                            ))}
                          </div>
                          {answer.evaluation?.idealAnswer && (
                            <div className="mt-4">
                              <p className="text-white/35 text-xs mb-1">Ideal answer</p>
                              <p className="text-white/65 text-sm">{answer.evaluation.idealAnswer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {session.status === 'completed' && (
                  <div className="glass-card p-5">
                    <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                      <Trophy className="w-4 h-4 text-amber-400" /> Final HR Readiness
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      {Object.entries(session.finalScores || {}).map(([key, value]) => (
                        <Metric key={key} label={key} value={value} tone="text-teal-300" />
                      ))}
                    </div>
                    <p className="text-white/70 mb-3">{session.finalFeedback}</p>
                    {(session.suggestions || []).map((item) => <p key={item} className="text-amber-300 text-sm">- {item}</p>)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Select = ({ label, value, values, onChange }) => (
  <div>
    <label className="block text-white/55 text-sm mb-2">{label}</label>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="input-field">
      {values.map((item) => <option key={item} className="bg-navy-800">{item}</option>)}
    </select>
  </div>
);

const Metric = ({ label, value, tone }) => (
  <div className="rounded-xl bg-white/[0.03] p-3 text-center">
    <p className={`font-display text-lg font-bold ${tone}`}>{value}</p>
    <p className="text-white/35 text-xs capitalize">{label}</p>
  </div>
);

export default HRRoundPracticePage;
