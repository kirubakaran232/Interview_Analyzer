import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock3, Brain, Trophy, Target, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAptitudeCatalog,
  generateAptitudeQuestion,
  submitAptitudeAttempt,
  getAptitudeSummary,
  startAptitudeMockTest,
  submitAptitudeMockTest,
} from '../services/api';

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

const AptitudePracticePage = () => {
  const [catalog, setCatalog] = useState({});
  const categories = Object.keys(catalog);
  const [setup, setSetup] = useState({ category: 'Quantitative Aptitude', topic: 'Number System', difficulty: 'Beginner' });
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState('practice');
  const [mockTest, setMockTest] = useState(null);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState([]);
  const [mockSeconds, setMockSeconds] = useState(1800);
  const [mockResult, setMockResult] = useState(null);

  useEffect(() => {
    getAptitudeCatalog().then(({ data }) => {
      setCatalog(data.catalog);
    });
    getAptitudeSummary().then(({ data }) => setSummary(data.summary)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!question || submitted) return undefined;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [question, submitted]);

  useEffect(() => {
    if (!mockTest || mockResult) return undefined;
    const timer = setInterval(() => setMockSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [mockTest, mockResult]);

  const topics = catalog[setup.category] || [];
  const currentMockQuestion = mockTest?.questions?.[mockIndex];

  const updateCategory = (category) => {
    const nextTopic = catalog[category]?.[0] || '';
    setSetup((value) => ({ ...value, category, topic: nextTopic }));
  };

  const startPractice = async () => {
    const { data } = await generateAptitudeQuestion(setup);
    setQuestion(data.question);
    setSelectedAnswer('');
    setElapsed(0);
    setSubmitted(false);
  };

  const submitPractice = async () => {
    if (!selectedAnswer) return toast.error('Choose an answer first');
    await submitAptitudeAttempt({
      ...setup,
      question,
      selectedAnswer,
      timeTakenSeconds: elapsed,
    });
    setSubmitted(true);
    const { data } = await getAptitudeSummary();
    setSummary(data.summary);
  };

  const startMock = async () => {
    const { data } = await startAptitudeMockTest({ difficulty: setup.difficulty });
    setMockTest(data.mockTest);
    setMockIndex(0);
    setMockAnswers([]);
    setMockSeconds(1800);
    setMockResult(null);
  };

  const chooseMockAnswer = (answer) => {
    setMockAnswers((items) => {
      const next = [...items];
      next[mockIndex] = {
        category: currentMockQuestion.concept || 'Mixed',
        topic: currentMockQuestion.concept || 'Mixed',
        selectedAnswer: answer,
        timeTakenSeconds: 60,
      };
      return next;
    });
  };

  const finishMock = async () => {
    const { data } = await submitAptitudeMockTest(mockTest._id, { answers: mockAnswers });
    setMockResult(data.mockTest);
    const summaryResponse = await getAptitudeSummary();
    setSummary(summaryResponse.data.summary);
  };

  const mockProgress = mockTest ? Math.round(((mockIndex + 1) / mockTest.questions.length) * 100) : 0;
  const formattedMockTime = `${String(Math.floor(mockSeconds / 60)).padStart(2, '0')}:${String(mockSeconds % 60).padStart(2, '0')}`;

  const suggestionList = useMemo(() => summary?.suggestions || [], [summary]);

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-400" /> Aptitude Practice
          </h1>
        </div>

        <div className="flex gap-2 mb-6">
          {['practice', 'mock'].map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-lg text-sm ${tab === item ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/50'}`}>
              {item}
            </button>
          ))}
        </div>

        {tab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <div className="space-y-5">
              <div className="glass-card p-5 space-y-4">
                <div>
                  <label className="block text-white/55 text-sm mb-2">Category</label>
                  <select value={setup.category} onChange={(event) => updateCategory(event.target.value)} className="input-field">
                    {categories.map((category) => <option key={category} className="bg-navy-800">{category}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/55 text-sm mb-2">Topic</label>
                  <select value={setup.topic} onChange={(event) => setSetup({ ...setup, topic: event.target.value })} className="input-field">
                    {topics.map((topic) => <option key={topic} className="bg-navy-800">{topic}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/55 text-sm mb-2">Difficulty</label>
                  <select value={setup.difficulty} onChange={(event) => setSetup({ ...setup, difficulty: event.target.value })} className="input-field">
                    {difficulties.map((difficulty) => <option key={difficulty} className="bg-navy-800">{difficulty}</option>)}
                  </select>
                </div>
                <button onClick={startPractice} className="btn-primary w-full">Generate Question</button>
              </div>

              {summary && (
                <div className="glass-card p-5">
                  <h2 className="text-white font-semibold mb-4">Performance</h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Stat label="Attended" value={summary.totalQuestions} />
                    <Stat label="Correct" value={summary.correctAnswers} />
                    <Stat label="Wrong" value={summary.wrongAnswers} />
                    <Stat label="Accuracy" value={`${summary.accuracy}%`} />
                    <Stat label="Avg Time" value={`${summary.averageTimePerQuestion}s`} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {!question ? (
                <div className="glass-card p-10 text-center text-white/35">Generate a question to begin.</div>
              ) : (
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-amber-300 text-sm">{setup.topic}</span>
                    <span className="flex items-center gap-1 text-white/45 text-sm"><Clock3 className="w-4 h-4" /> {elapsed}s</span>
                  </div>
                  <h2 className="text-white text-xl font-semibold leading-relaxed">{question.question}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                    {question.options.map((option) => (
                      <button key={option} onClick={() => setSelectedAnswer(option)} className={`rounded-xl border px-4 py-3 text-left ${selectedAnswer === option ? 'border-amber-400 bg-amber-500/10 text-amber-200' : 'border-white/10 bg-white/[0.03] text-white/70'}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                  <button onClick={submitPractice} disabled={submitted} className="btn-primary mt-5">
                    {submitted ? 'Submitted' : 'Submit Answer'}
                  </button>

                  {submitted && (
                    <div className="mt-6 space-y-4">
                      <Feedback label="Correct answer" value={question.correctAnswer} />
                      <Feedback label="Explanation" value={question.explanation} />
                      <Feedback label="Shortcut method" value={question.shortcutMethod} />
                      <Feedback label="Related concept" value={question.concept} />
                      <Feedback label="Next practice" value={question.similarPracticeSuggestion} />
                    </div>
                  )}
                </div>
              )}

              {suggestionList.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-cyan-400" /> Personalized suggestions
                  </h3>
                  <div className="space-y-2 text-white/65 text-sm">
                    {suggestionList.map((item) => <p key={item}>{item}</p>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'mock' && (
          <div className="space-y-5">
            {!mockTest ? (
              <div className="glass-card p-8">
                <h2 className="text-white text-xl font-semibold mb-2">30-question mock test</h2>
                <p className="text-white/55 mb-5">30 minutes, mixed topics, final score, rank-style performance, and topic-wise analysis.</p>
                <button onClick={startMock} className="btn-primary">Start Mock Test</button>
              </div>
            ) : mockResult ? (
              <div className="glass-card p-6">
                <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> {mockResult.rankStylePerformance}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                  <Stat label="Final score" value={`${mockResult.finalScore}/30`} />
                  <Stat label="Accuracy" value={`${mockResult.accuracy}%`} />
                  <Stat label="Correct" value={mockResult.correctAnswers} />
                  <Stat label="Wrong" value={mockResult.wrongAnswers} />
                </div>
              </div>
            ) : (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/45 text-sm">Question {mockIndex + 1}/30</p>
                    <div className="w-48 h-2 rounded-full bg-white/5 mt-2">
                      <div className="h-2 rounded-full bg-amber-500" style={{ width: `${mockProgress}%` }} />
                    </div>
                  </div>
                  <span className="text-amber-300 text-lg">{formattedMockTime}</span>
                </div>
                <h2 className="text-white text-xl font-semibold">{currentMockQuestion.question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                  {currentMockQuestion.options.map((option) => (
                    <button key={option} onClick={() => chooseMockAnswer(option)} className={`rounded-xl border px-4 py-3 text-left ${mockAnswers[mockIndex]?.selectedAnswer === option ? 'border-amber-400 bg-amber-500/10 text-amber-200' : 'border-white/10 bg-white/[0.03] text-white/70'}`}>
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  {mockIndex < 29 ? (
                    <button onClick={() => setMockIndex((value) => value + 1)} className="btn-primary">Next Question</button>
                  ) : (
                    <button onClick={finishMock} className="btn-primary flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4" /> Finish Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-xl bg-white/[0.03] p-3">
    <p className="text-white/35 text-xs">{label}</p>
    <p className="text-white text-lg font-semibold">{value}</p>
  </div>
);

const Feedback = ({ label, value }) => (
  <div>
    <p className="text-white/35 text-xs mb-1">{label}</p>
    <p className="text-white/70 text-sm leading-relaxed">{value}</p>
  </div>
);

export default AptitudePracticePage;
