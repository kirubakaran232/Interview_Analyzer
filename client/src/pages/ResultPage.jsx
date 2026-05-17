import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSessionById } from '../services/api';
import { useInterview } from '../context/InterviewContext';
import { getGrade, getScoreColor } from '../utils/scoringEngine';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import {
  Award, TrendingUp, MessageSquare, ChevronDown, ChevronUp,
  Download, RotateCcw, Home, CheckCircle, AlertCircle, Zap,
  Eye, Mic, Brain, Activity, Star
} from 'lucide-react';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ScoreCircle = ({ score, label, size = 'md' }) => {
  const color = getScoreColor(score);
  const grade = getGrade(score);
  const r = size === 'lg' ? 56 : 40;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${size === 'lg' ? 'w-36 h-36' : 'w-24 h-24'}`}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${(r + 12) * 2} ${(r + 12) * 2}`}>
          <circle
            cx={r + 12} cy={r + 12} r={r}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"
          />
          <circle
            cx={r + 12} cy={r + 12} r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display font-bold leading-none ${size === 'lg' ? 'text-4xl' : 'text-2xl'}`}
            style={{ color }}
          >
            {score}
          </span>
          {size === 'lg' && (
            <span className="text-white/40 text-xs mt-1">{grade.grade}</span>
          )}
        </div>
      </div>
      <p className="text-white/60 text-sm text-center">{label}</p>
    </div>
  );
};

const ResultPage = () => {
  const { id } = useParams();
  const { state } = useInterview();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getSessionById(id);
        setSession(data.session);
      } catch {
        // Use in-memory state if API fails
        if (state.scores) {
          setSession({
            domain: state.domain,
            difficulty: state.difficulty,
            scores: state.scores,
            suggestions: state.suggestions,
            questions: state.questions,
            sessionDate: new Date().toISOString(),
          });
        } else {
          toast.error('Session not found');
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <Loader text="Loading your results..." />;
  if (!session) return null;

  const { scores, suggestions, questions, domain, difficulty } = session;
  const overall = scores?.overall || 0;
  const overallGrade = getGrade(overall);

  const radarData = [
    { subject: 'Communication', value: scores?.communication || 0, fullMark: 100 },
    { subject: 'Confidence', value: scores?.confidence || 0, fullMark: 100 },
    { subject: 'Body Language', value: scores?.bodyLanguage || 0, fullMark: 100 },
    { subject: 'Technical', value: scores?.technicalExplanation || 0, fullMark: 100 },
    { subject: 'HR Readiness', value: scores?.hrReadiness || 0, fullMark: 100 },
  ];

  const barData = radarData.map((d) => ({ name: d.subject.split(' ')[0], value: d.value }));

  const scoreCards = [
    { key: 'communication', label: 'Communication', icon: Mic, color: '#6C63FF' },
    { key: 'confidence', label: 'Confidence', icon: Zap, color: '#00D4FF' },
    { key: 'bodyLanguage', label: 'Body Language', icon: Eye, color: '#22C55E' },
    { key: 'technicalExplanation', label: 'Technical', icon: Brain, color: '#F59E0B' },
    { key: 'hrReadiness', label: 'HR Readiness', icon: Activity, color: '#F472B6' },
  ];

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <Award className="w-4 h-4" /> Interview Complete
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Your Interview Results
          </h1>
          <p className="text-white/40">
            {domain} • {difficulty} level • {new Date(session.sessionDate).toLocaleDateString()}
          </p>
        </div>

        {/* ── Overall Score Hero ─────────────────────────────── */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-500/5" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
            style={{ background: `${overallGrade.color}20` }} />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Overall score circle */}
            <div className="flex flex-col items-center">
              <ScoreCircle score={overall} label="Overall Score" size="lg" />
              <div className="mt-3 px-4 py-1.5 rounded-full border"
                style={{ background: `${overallGrade.color}15`, borderColor: `${overallGrade.color}40`, color: overallGrade.color }}>
                <span className="text-sm font-bold">{overallGrade.label}</span>
              </div>
            </div>

            {/* Score cards grid */}
            <div className="flex-1 grid grid-cols-3 sm:grid-cols-5 gap-4">
              {scoreCards.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2"
                    style={{ background: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="font-display text-xl font-bold" style={{ color }}>
                    {scores?.[key] || 0}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Charts ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Radar Chart */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-violet-400" /> Performance Radar
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#6C63FF"
                  fill="#6C63FF"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Score Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                  itemStyle={{ color: '#6C63FF' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={getScoreColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── AI Suggestions ─────────────────────────────────── */}
        {suggestions?.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-pink-400" /> AI Improvement Suggestions
            </h2>
            <div className="space-y-3">
              {suggestions.map((tip, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-violet-400 text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Q&A Breakdown ─────────────────────────────────── */}
        {questions?.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" /> Question & Answer Review
            </h2>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-medium truncate">{q.questionText}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                        <span>{q.questionType}</span>
                        {q.speakingSpeed > 0 && <span>{q.speakingSpeed} WPM</span>}
                        {q.fillerWords > 0 && <span>{q.fillerWords} fillers</span>}
                      </div>
                    </div>
                    {expandedQ === i
                      ? <ChevronUp className="w-4 h-4 text-white/30" />
                      : <ChevronDown className="w-4 h-4 text-white/30" />
                    }
                  </button>

                  {expandedQ === i && (
                    <div className="px-4 pb-4 bg-white/[0.02]">
                      <div className="p-3 bg-navy-800 rounded-xl border border-white/5">
                        <p className="text-white/40 text-xs mb-2">YOUR ANSWER:</p>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {q.transcript || <span className="italic text-white/30">No transcript available</span>}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard" className="btn-secondary flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/interview/setup" className="btn-primary flex items-center justify-center gap-2 flex-1">
            <RotateCcw className="w-4 h-4" /> Practice Again
          </Link>
          <Link to="/history" className="btn-secondary flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" /> View Progress
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
