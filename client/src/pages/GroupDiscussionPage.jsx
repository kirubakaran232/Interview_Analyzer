import { useEffect, useState } from 'react';
import { Users, Send, Square, Trophy, MessageSquare, History, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  startGroupDiscussion,
  sendGroupDiscussionTurn,
  endGroupDiscussion,
  getGroupDiscussionHistory,
} from '../services/api';

const topics = [
  'Artificial Intelligence in education',
  'Work from home vs office work',
  'Is social media good for students?',
  'Should coding be taught from school?',
  'Impact of startups on Indian economy',
  'Is group discussion a good hiring method?',
];

const categories = ['Technology', 'Business', 'Social Issues', 'Education', 'Current Affairs'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

const GroupDiscussionPage = () => {
  const [setup, setSetup] = useState({
    topic: topics[0],
    category: 'Technology',
    difficulty: 'Intermediate',
    durationMinutes: 10,
  });
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    getGroupDiscussionHistory().then(({ data }) => setHistory(data.sessions || [])).catch(() => {});
  }, []);

  const start = async () => {
    setLoading(true);
    try {
      const { data } = await startGroupDiscussion(setup);
      setSession(data.session);
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not start discussion');
    } finally {
      setLoading(false);
    }
  };

  const sendTurn = async () => {
    if (!message.trim()) return toast.error('Type your point first');
    const currentMessage = message;
    setMessage('');
    try {
      const { data } = await sendGroupDiscussionTurn(session._id, { message: currentMessage });
      setSession(data.session);
    } catch {
      setMessage(currentMessage);
      toast.error('Could not send your point');
    }
  };

  const finish = async () => {
    setEnding(true);
    try {
      const { data } = await endGroupDiscussion(session._id);
      setSession(data.session);
      setHistory((items) => [data.session, ...items.filter((item) => item._id !== data.session._id)]);
    } catch {
      toast.error('Could not finish discussion');
    } finally {
      setEnding(false);
    }
  };

  const scores = session?.scores;

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" /> Group Discussion Judger
          </h1>
          <p className="text-white/45 mt-2">Practice placement GD rounds with AI participants and structured evaluation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          <div className="space-y-5">
            <div className="glass-card p-5 space-y-4">
              <div>
                <label className="block text-white/55 text-sm mb-2">Topic</label>
                <select value={setup.topic} onChange={(event) => setSetup({ ...setup, topic: event.target.value })} className="input-field">
                  {topics.map((topic) => <option key={topic} className="bg-navy-800">{topic}</option>)}
                </select>
              </div>
              <input
                value={setup.topic}
                onChange={(event) => setSetup({ ...setup, topic: event.target.value })}
                className="input-field text-sm"
                placeholder="Or type custom GD topic"
              />
              <div>
                <label className="block text-white/55 text-sm mb-2">Category</label>
                <select value={setup.category} onChange={(event) => setSetup({ ...setup, category: event.target.value })} className="input-field">
                  {categories.map((category) => <option key={category} className="bg-navy-800">{category}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/55 text-sm mb-2">Difficulty</label>
                <select value={setup.difficulty} onChange={(event) => setSetup({ ...setup, difficulty: event.target.value })} className="input-field">
                  {difficulties.map((difficulty) => <option key={difficulty} className="bg-navy-800">{difficulty}</option>)}
                </select>
              </div>
              <button onClick={start} disabled={loading} className="btn-primary w-full">
                {loading ? 'Starting...' : 'Start GD'}
              </button>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-cyan-400" /> Recent GD sessions
              </h2>
              <div className="space-y-2">
                {history.slice(0, 5).map((item) => (
                  <button key={item._id} onClick={() => setSession(item)} className="w-full rounded-lg bg-white/[0.03] px-3 py-2 text-left">
                    <p className="text-white/70 text-sm truncate">{item.topic}</p>
                    <p className="text-white/30 text-xs">Score {item.scores?.overall || 0} / {item.status}</p>
                  </button>
                ))}
                {history.length === 0 && <p className="text-white/30 text-sm">No GD sessions yet.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {!session ? (
              <div className="glass-card p-10 text-center text-white/35">
                Start a group discussion to begin.
              </div>
            ) : (
              <>
                <div className="glass-card p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-blue-300 text-sm">{session.category} / {session.difficulty}</p>
                      <h2 className="text-white text-xl font-semibold">{session.topic}</h2>
                    </div>
                    {session.status !== 'completed' && (
                      <button onClick={finish} disabled={ending} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                        <Square className="w-4 h-4" /> {ending ? 'Evaluating...' : 'End & Evaluate'}
                      </button>
                    )}
                  </div>

                  <div className="h-[420px] overflow-y-auto rounded-xl bg-navy-950/60 border border-white/5 p-4 space-y-3">
                    {session.turns.map((turn, index) => (
                      <div key={`${turn.timestamp}-${index}`} className={`flex ${turn.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl px-4 py-3 ${turn.role === 'candidate' ? 'bg-blue-500/20 border border-blue-400/30' : turn.role === 'moderator' ? 'bg-violet-500/15 border border-violet-400/20' : 'bg-white/[0.05] border border-white/10'}`}>
                          <p className="text-xs text-white/35 mb-1">{turn.speaker}</p>
                          <p className="text-white/75 text-sm leading-relaxed">{turn.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {session.status !== 'completed' && (
                    <div className="flex gap-3 mt-4">
                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={2}
                        className="input-field resize-none text-sm"
                        placeholder="Add your point to the discussion..."
                      />
                      <button onClick={sendTurn} className="btn-primary px-5 flex items-center gap-2">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {session.status === 'completed' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="glass-card p-5">
                      <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                        <Trophy className="w-4 h-4 text-amber-400" /> GD Scores
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(scores || {}).map(([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between text-sm text-white/55 mb-1">
                              <span className="capitalize">{key}</span>
                              <span>{value}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full">
                              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass-card p-5">
                      <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> Feedback
                      </h3>
                      <p className="text-white/65 text-sm mb-4">{session.summary}</p>
                      <p className="text-white/40 text-xs mb-2">Strengths</p>
                      {(session.strengths || []).map((item) => <p key={item} className="text-green-300 text-sm mb-1">- {item}</p>)}
                      <p className="text-white/40 text-xs mt-4 mb-2">Improvements</p>
                      {(session.improvements || []).map((item) => <p key={item} className="text-amber-300 text-sm mb-1">- {item}</p>)}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="glass-card p-4 flex gap-3 text-white/45 text-sm">
              <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p>Tip: Introduce a clear point, support it with an example, respond to another participant, and summarize when the discussion slows down.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionPage;
