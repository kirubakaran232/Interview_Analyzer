import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSessionHistory } from '../services/api';
import { getScoreColor, getGrade } from '../utils/scoringEngine';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, Calendar, Clock, ChevronRight, Play,
  Award, BarChart3, Filter
} from 'lucide-react';
import { InlineLoader } from '../components/common/Loader';

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getSessionHistory();
        setSessions(data.sessions || []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? sessions : sessions.filter((s) => s.domain === filter);
  const domains = [...new Set(sessions.map((s) => s.domain))];

  // Chart data
  const chartData = filtered.slice().reverse().map((s, i) => ({
    session: `#${i + 1}`,
    overall: s.scores?.overall || 0,
    communication: s.scores?.communication || 0,
    confidence: s.scores?.confidence || 0,
    date: new Date(s.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const avg = (key) =>
    sessions.length
      ? Math.round(sessions.reduce((s, se) => s + (se.scores?.[key] || 0), 0) / sessions.length)
      : 0;

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <TrendingUp className="w-7 h-7 text-violet-400" />
            Interview History
          </h1>
          <p className="text-white/40">Track your progress across all sessions</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          {[
            { label: 'Sessions', value: sessions.length, icon: Calendar, color: 'text-violet-400' },
            { label: 'Avg Overall', value: `${avg('overall')}%`, icon: Award, color: 'text-amber-400' },
            { label: 'Avg Communication', value: `${avg('communication')}%`, icon: BarChart3, color: 'text-cyan-400' },
            { label: 'Avg Confidence', value: `${avg('confidence')}%`, icon: TrendingUp, color: 'text-green-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-4">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-white/40 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress Chart */}
        {chartData.length > 1 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="font-display font-semibold text-white mb-4">Progress Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                />
                <Area type="monotone" dataKey="overall" stroke="#6C63FF" fill="url(#overallGrad)" strokeWidth={2} name="Overall" />
                <Area type="monotone" dataKey="communication" stroke="#00D4FF" fill="url(#commGrad)" strokeWidth={2} name="Communication" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filter */}
        {domains.length > 1 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter className="w-4 h-4 text-white/30" />
            {['all', ...domains].map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filter === d
                    ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                    : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>
        )}

        {/* Session List */}
        {loading ? (
          <InlineLoader text="Loading sessions..." />
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 mb-4">No interview sessions yet.</p>
            <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2">
              <Play className="w-4 h-4" /> Start Your First Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => {
              const overall = session.scores?.overall || 0;
              const grade = getGrade(overall);
              return (
                <Link
                  key={session._id}
                  to={`/results/${session._id}`}
                  className="glass-card-hover p-5 flex items-center gap-4"
                >
                  {/* Score circle */}
                  <div
                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border"
                    style={{
                      background: `${getScoreColor(overall)}15`,
                      borderColor: `${getScoreColor(overall)}30`,
                    }}
                  >
                    <span className="font-display font-bold text-xl leading-none" style={{ color: getScoreColor(overall) }}>
                      {overall}
                    </span>
                    <span className="text-white/30 text-xs">{grade.grade}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{session.domain}</p>
                    <div className="flex items-center gap-3 mt-1 text-white/40 text-xs flex-wrap">
                      <span className="capitalize">{session.difficulty}</span>
                      <span>{session.questions?.length || 0} questions</span>
                    </div>
                    {/* Mini score bars */}
                    <div className="flex gap-2 mt-2">
                      {[
                        { k: 'communication', c: '#6C63FF' },
                        { k: 'confidence', c: '#00D4FF' },
                        { k: 'bodyLanguage', c: '#22C55E' },
                      ].map(({ k, c }) => (
                        <div key={k} className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${session.scores?.[k] || 0}%`, background: c }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-white/40 text-xs flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </p>
                    <p className="text-white/20 text-xs mt-1">
                      {new Date(session.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-white/20" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
