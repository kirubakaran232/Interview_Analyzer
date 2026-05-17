import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSessionHistory } from '../services/api';
import {
  Video, FileText, BookOpen, Code, Users, Headphones,
  Brain, TrendingUp, Clock, Award, ChevronRight, Zap,
  Lock, Play, BarChart3, Calendar
} from 'lucide-react';
import { InlineLoader } from '../components/common/Loader';

// Dashboard module definitions
const MODULES = [
  {
    id: 'interview-judger',
    icon: Video,
    title: 'Interview Judger',
    description: 'AI-powered mock interviews with real-time body language, speech, and answer analysis.',
    color: 'from-violet-600 to-cyan-500',
    shadowColor: 'shadow-violet-500/20',
    active: true,
    path: '/interview/setup',
    stats: ['Body Language', 'Speech Analysis', 'AI Feedback'],
  },
  {
    id: 'resume-analyzer',
    icon: FileText,
    title: 'Resume Analyzer',
    description: 'AI-powered resume scoring with ATS optimization and content improvement tips.',
    color: 'from-pink-600 to-violet-600',
    shadowColor: 'shadow-pink-500/20',
    active: true,
    path: '/resume-analyzer',
    stats: ['ATS Score', 'Keyword Match', 'Format Check'],
  },
  {
    id: 'aptitude-practice',
    icon: BookOpen,
    title: 'Aptitude Practice',
    description: 'Quantitative, logical reasoning, and verbal aptitude question banks with timed tests.',
    color: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/20',
    active: true,
    path: '/aptitude-practice',
    stats: ['Quant', 'Logical', 'Verbal'],
  },
  {
    id: 'coding-interview',
    icon: Code,
    title: 'Coding Interview',
    description: 'LeetCode-style problems with AI-powered hints and time complexity analysis.',
    color: 'from-green-500 to-cyan-600',
    shadowColor: 'shadow-green-500/20',
    active: true,
    path: '/coding-interview',
    stats: ['DSA Problems', 'AI Hints', 'Code Review'],
  },
  {
    id: 'group-discussion',
    icon: Users,
    title: 'Group Discussion Judger',
    description: 'Simulate GD rounds with AI participants, content scoring, and leadership analysis.',
    color: 'from-blue-500 to-violet-600',
    shadowColor: 'shadow-blue-500/20',
    active: false,
    path: null,
    stats: ['Content', 'Leadership', 'Initiative'],
  },
  {
    id: 'communication-trainer',
    icon: Headphones,
    title: 'Communication Trainer',
    description: 'Accent clarity, grammar, and professional English fluency training sessions.',
    color: 'from-rose-500 to-pink-600',
    shadowColor: 'shadow-rose-500/20',
    active: false,
    path: null,
    stats: ['Accent', 'Grammar', 'Fluency'],
  },
  {
    id: 'hr-round',
    icon: Brain,
    title: 'HR Round Practice',
    description: 'Practice situational and behavioral HR questions with AI evaluation.',
    color: 'from-teal-500 to-green-600',
    shadowColor: 'shadow-teal-500/20',
    active: false,
    path: null,
    stats: ['Behavioral', 'Situational', 'STAR Method'],
  },
];

const ModuleCard = ({ module }) => {
  const { icon: Icon, title, description, color, shadowColor, active, path, stats } = module;

  const content = (
    <div
      className={`glass-card p-6 h-full relative overflow-hidden transition-all duration-300 group
        ${active
          ? `hover:-translate-y-2 hover:shadow-xl ${shadowColor} cursor-pointer border-white/10 hover:border-violet-400/30`
          : 'opacity-50 cursor-not-allowed'
        }`}
    >
      {/* Gradient glow on hover */}
      {active && (
        <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
      )}

      {/* Status badge */}
      <div className="absolute top-4 right-4">
        {active ? (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-500/20 rounded-full text-violet-400 text-xs font-medium">
            <Zap className="w-3 h-3" /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full text-white/30 text-xs">
            <Lock className="w-3 h-3" /> Soon
          </span>
        )}
      </div>

      {/* Icon */}
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed mb-4">{description}</p>

      {/* Feature tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {stats.map((s) => (
          <span key={s} className="px-2 py-0.5 bg-white/5 rounded-md text-white/30 text-xs">{s}</span>
        ))}
      </div>

      {active && (
        <div className="flex items-center gap-1.5 text-violet-400 text-sm font-medium group-hover:gap-2.5 transition-all">
          <Play className="w-4 h-4" /> Start Now
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return active && path ? <Link to={path} className="block h-full">{content}</Link> : content;
};

const DashboardPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await getSessionHistory();
        setSessions(data.sessions || []);
      } catch {
        // Silently fail — no sessions yet
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  const firstName = (userProfile?.displayName || currentUser?.displayName || 'there').split(' ')[0];
  const totalSessions = sessions.length;
  const avgOverall = totalSessions
    ? Math.round(sessions.reduce((s, sess) => s + (sess.scores?.overall || 0), 0) / totalSessions)
    : 0;
  const lastSession = sessions[0];

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Welcome Header ─────────────────────────────────── */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-white/40 text-sm mb-1">{timeOfDay()},</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                {firstName}! <span className="gradient-text">Ready to practice?</span>
              </h1>
              <p className="text-white/40 mt-2">
                {totalSessions === 0
                  ? "You haven't done any interviews yet. Start your first one below!"
                  : `You've completed ${totalSessions} interview session${totalSessions > 1 ? 's' : ''}. Keep improving!`
                }
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4">
              <div className="glass-card px-5 py-4 text-center min-w-[90px]">
                <div className="font-display text-2xl font-bold gradient-text">{totalSessions}</div>
                <div className="text-white/40 text-xs mt-0.5">Sessions</div>
              </div>
              <div className="glass-card px-5 py-4 text-center min-w-[90px]">
                <div className="font-display text-2xl font-bold text-amber-400">{avgOverall || '—'}</div>
                <div className="text-white/40 text-xs mt-0.5">Avg Score</div>
              </div>
              <div className="glass-card px-5 py-4 text-center min-w-[90px]">
                <div className="font-display text-2xl font-bold text-green-400">
                  {lastSession ? `${lastSession.scores?.overall || 0}` : '—'}
                </div>
                <div className="text-white/40 text-xs mt-0.5">Last Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Start Banner ─────────────────────────────── */}
        {totalSessions === 0 && (
          <div className="mb-10 glass-card p-6 relative overflow-hidden border-violet-500/20 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-cyan-500/5" />
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl shadow-lg shadow-violet-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display text-xl font-bold text-white mb-1">
                  Start your first AI Interview!
                </h2>
                <p className="text-white/50 text-sm">
                  Your AI interviewer is ready. Set your domain, skills, and start a real mock interview in 60 seconds.
                </p>
              </div>
              <Link to="/interview/setup" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                <Play className="w-4 h-4" />
                Start Interview
              </Link>
            </div>
          </div>
        )}

        {/* ── Modules Grid ──────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-white">Platform Modules</h2>
            <Link to="/modules" className="text-violet-400 text-sm hover:text-violet-300 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {MODULES.map((mod) => (
              <ModuleCard key={mod.id} module={mod} />
            ))}
          </div>
        </div>

        {/* ── Recent Sessions ───────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              Recent Sessions
            </h2>
            {sessions.length > 0 && (
              <Link to="/history" className="text-violet-400 text-sm hover:text-violet-300 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {loadingSessions ? (
            <InlineLoader text="Loading sessions..." />
          ) : sessions.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Calendar className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No sessions yet. Complete your first interview to see results here.</p>
              <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm py-2">
                <Play className="w-4 h-4" /> Start First Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <Link
                  key={session._id}
                  to={`/results/${session._id}`}
                  className="glass-card-hover p-4 flex items-center gap-4"
                >
                  {/* Score circle */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="font-display font-bold text-violet-400 text-lg leading-none">
                      {session.scores?.overall || 0}
                    </span>
                    <span className="text-white/30 text-xs">score</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{session.domain} Interview</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {session.questions?.length || 0} questions • {session.difficulty}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-white/30 text-xs">
                      <Clock className="w-3 h-3" />
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {session.scores?.overall >= 70 ? (
                        <span className="text-green-400 text-xs flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> Good
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> Keep going
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-white/20" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
