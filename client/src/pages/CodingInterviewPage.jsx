import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Lightbulb, Send, ListChecks, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  startCodingSession,
  requestCodingHint,
  submitCodingSession,
  getRoadmap,
  updateRoadmapStatus,
  getDailyPlan,
} from '../services/api';

const languages = ['Java', 'Python', 'JavaScript', 'C++'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const topics = ['Arrays', 'Strings', 'Two Pointers', 'Sliding Window', 'Stack', 'Queue', 'Linked List', 'Tree', 'Graph', 'DP', 'Greedy', 'Backtracking'];
const editorLanguage = { Java: 'java', Python: 'python', JavaScript: 'javascript', 'C++': 'cpp' };

const CodingInterviewPage = () => {
  const [setup, setSetup] = useState({ language: 'JavaScript', level: 'Beginner', topic: 'Arrays' });
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('// Write your solution here');
  const [roadmap, setRoadmap] = useState([]);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [tab, setTab] = useState('interview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRoadmap().then(({ data }) => setRoadmap(data.roadmap || [])).catch(() => {});
    getDailyPlan().then(({ data }) => setDailyPlan(data.plan || [])).catch(() => {});
  }, []);

  const groupedRoadmap = useMemo(() => roadmap.reduce((acc, problem) => {
    acc[problem.topic] ||= [];
    acc[problem.topic].push(problem);
    return acc;
  }, {}), [roadmap]);

  const start = async () => {
    setLoading(true);
    try {
      const { data } = await startCodingSession(setup);
      setSession(data.session);
      setCode('// Write your solution here');
    } catch {
      toast.error('Could not start coding session');
    } finally {
      setLoading(false);
    }
  };

  const hint = async () => {
    const { data } = await requestCodingHint(session._id, { code });
    setSession((current) => ({ ...current, hints: data.hints }));
  };

  const submit = async () => {
    const { data } = await submitCodingSession(session._id, { code });
    setSession(data.session);
  };

  const changeStatus = async (problemId, status) => {
    await updateRoadmapStatus(problemId, { status });
    setRoadmap((items) => items.map((item) => item.id === problemId ? { ...item, status } : item));
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
            <Code className="w-7 h-7 text-green-400" /> Coding Interview + DSA Practice
          </h1>
        </div>

        <div className="flex gap-2 mb-6">
          {['interview', 'roadmap', 'daily'].map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-lg text-sm ${tab === item ? 'bg-green-500/20 text-green-300' : 'bg-white/5 text-white/50'}`}>
              {item}
            </button>
          ))}
        </div>

        {tab === 'interview' && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <div className="space-y-5">
              <div className="glass-card p-5 space-y-4">
                {[
                  ['language', languages],
                  ['level', levels],
                  ['topic', topics],
                ].map(([key, values]) => (
                  <div key={key}>
                    <label className="block text-white/55 text-sm mb-2 capitalize">{key}</label>
                    <select value={setup[key]} onChange={(event) => setSetup({ ...setup, [key]: event.target.value })} className="input-field">
                      {values.map((value) => <option key={value} value={value} className="bg-navy-800">{value}</option>)}
                    </select>
                  </div>
                ))}
                <button onClick={start} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Starting...' : 'Start Session'}
                </button>
              </div>

              {session && (
                <div className="glass-card p-5">
                  <h2 className="text-white font-semibold mb-3">{session.question.title}</h2>
                  <p className="text-white/60 text-sm leading-relaxed">{session.question.prompt}</p>
                  <div className="mt-4 space-y-2 text-xs text-white/45">
                    {(session.question.examples || []).map((item) => <p key={item}>{item}</p>)}
                  </div>
                  <button onClick={hint} className="btn-secondary w-full mt-4 flex items-center justify-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Get Hint
                  </button>
                  {(session.hints || []).map((item) => (
                    <p key={item} className="mt-3 rounded-lg bg-white/[0.03] p-3 text-sm text-amber-200">{item}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="glass-card overflow-hidden">
                <Editor
                  height="420px"
                  theme="vs-dark"
                  language={editorLanguage[setup.language]}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                />
              </div>
              <button disabled={!session} onClick={submit} className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" /> Submit for Review
              </button>

              {session?.feedback?.verdict && (
                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold mb-3">AI Review</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div><p className="text-white/35 text-xs">Logic</p><p className="text-green-400 text-xl">{session.feedback.logicScore}</p></div>
                    <div><p className="text-white/35 text-xs">Readability</p><p className="text-cyan-400 text-xl">{session.feedback.readabilityScore}</p></div>
                    <div><p className="text-white/35 text-xs">Time</p><p className="text-white/75">{session.feedback.timeComplexity}</p></div>
                    <div><p className="text-white/35 text-xs">Space</p><p className="text-white/75">{session.feedback.spaceComplexity}</p></div>
                  </div>
                  <p className="text-white/70">{session.feedback.verdict}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'roadmap' && (
          <div className="space-y-5">
            {Object.entries(groupedRoadmap).map(([topic, problems]) => (
              <div key={topic} className="glass-card p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-green-400" /> {topic}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-white/35">
                      <tr>
                        <th className="text-left pb-3">Problem</th>
                        <th className="text-left pb-3">Level</th>
                        <th className="text-left pb-3">Difficulty</th>
                        <th className="text-left pb-3">Pattern</th>
                        <th className="text-left pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.map((problem) => (
                        <tr key={problem.id} className="border-t border-white/5">
                          <td className="py-3">
                            <a href={problem.leetCodeLink} target="_blank" rel="noreferrer" className="text-white/75 hover:text-green-300">
                              {problem.title}
                            </a>
                            <p className="text-white/30 text-xs">{problem.whyImportant}</p>
                          </td>
                          <td>{problem.level}</td>
                          <td>{problem.difficulty}</td>
                          <td>{problem.pattern}</td>
                          <td>
                            <select value={problem.status} onChange={(event) => changeStatus(problem.id, event.target.value)} className="bg-white/5 rounded-lg px-2 py-1">
                              {['Not Started', 'Solved', 'Revisit'].map((status) => <option key={status} className="bg-navy-800">{status}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'daily' && (
          <div className="glass-card p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-cyan-400" /> Daily practice plan
            </h2>
            <div className="space-y-3">
              {dailyPlan.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-4">
                  <div>
                    <p className="text-white">{item.title}</p>
                    <p className="text-white/40 text-sm">{item.topic} / {item.pattern}</p>
                  </div>
                  <span className="text-cyan-300 text-sm">Slot {item.daySlot}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingInterviewPage;
