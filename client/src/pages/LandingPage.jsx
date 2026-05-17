import { Link } from 'react-router-dom';
import {
  Brain, Video, Mic, BarChart3, Star, ArrowRight, CheckCircle,
  MessageSquare, Eye, Activity, TrendingUp, Zap, Shield,
  Users, Code, FileText, BookOpen, Headphones
} from 'lucide-react';

// ── Module Cards Data ─────────────────────────────────────────
const modules = [
  {
    icon: Video,
    title: 'Interview Judger',
    desc: 'Real-time AI interview with body language, speech & answer analysis.',
    color: 'from-violet-600 to-cyan-500',
    active: true,
    badge: 'ACTIVE',
  },
  {
    icon: FileText,
    title: 'Resume Analyzer',
    desc: 'AI-powered resume scoring with ATS optimization tips.',
    color: 'from-pink-600 to-violet-600',
    active: false,
    badge: 'COMING SOON',
  },
  {
    icon: BookOpen,
    title: 'Aptitude Practice',
    desc: 'Quantitative, logical, and verbal aptitude question banks.',
    color: 'from-amber-500 to-orange-600',
    active: false,
    badge: 'COMING SOON',
  },
  {
    icon: Code,
    title: 'Coding Interview',
    desc: 'LeetCode-style problems with AI hints and time tracking.',
    color: 'from-green-500 to-cyan-600',
    active: false,
    badge: 'COMING SOON',
  },
  {
    icon: Users,
    title: 'Group Discussion',
    desc: 'Simulate GD rounds with AI participant and scoring.',
    color: 'from-blue-500 to-violet-600',
    active: false,
    badge: 'COMING SOON',
  },
  {
    icon: Headphones,
    title: 'Communication Trainer',
    desc: 'Accent, grammar, and fluency training for professionals.',
    color: 'from-rose-500 to-pink-600',
    active: false,
    badge: 'COMING SOON',
  },
];

// ── Features Data ─────────────────────────────────────────────
const features = [
  {
    icon: Eye,
    title: 'Live Body Language Analysis',
    desc: 'MediaPipe tracks eye contact, posture, head tilt, and facial expressions in real time without storing your video.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Mic,
    title: 'Speech & Fluency Scoring',
    desc: 'Web Speech API captures your answer live. AI detects filler words, measures WPM, and evaluates grammar.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Brain,
    title: 'Dynamic AI Interviewer',
    desc: 'Gemini AI asks real HR and technical questions based on your domain, skills, and previous answers — never static.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: BarChart3,
    title: '5-Dimension Scoring',
    desc: 'Communication, Confidence, Body Language, Technical Accuracy, and HR Readiness — all scored independently.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    desc: 'See your improvement over multiple sessions with interactive charts and personalized suggestions.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    desc: 'All camera analysis runs in your browser via MediaPipe. No raw video is ever sent to the server.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
];

// ── Stats ────────────────────────────────────────────────────
const stats = [
  { value: '10+', label: 'Analysis Metrics' },
  { value: '5', label: 'Score Dimensions' },
  { value: '100%', label: 'Browser-Side AI' },
  { value: '∞', label: 'Practice Sessions' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-navy-900 overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-start justify-center px-4 pt-28 md:pt-32 pb-16">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-10 animate-fade-in">
            <Zap className="w-4 h-4" />
            AI-Powered Interview Training Platform
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
            Ace Your Next
            <span className="block gradient-text text-shadow">
              Interview with AI
            </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Practice with a real AI interviewer that analyzes your body language, speech fluency,
            and answer quality — giving you detailed feedback to improve before the big day.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/signup" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Start Practicing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/30 text-sm animate-fade-in">
            {['No credit card required', 'Gemini AI powered', 'Privacy first — no video stored'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400/60" />
                {item}
              </span>
            ))}
          </div>

          {/* Hero visual */}
          <div className="mt-14 relative max-w-4xl mx-auto animate-float" style={{ animationDuration: '8s' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
            <div className="glass-card p-6 rounded-2xl glow-violet">
              <div className="grid grid-cols-3 gap-3">
                {/* Camera feed placeholder */}
                <div className="col-span-2 aspect-video bg-navy-800 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/5">
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="status-dot-active" />
                    <span className="text-xs text-green-400 font-medium">LIVE</span>
                  </div>
                  <div className="text-center">
                    <Video className="w-10 h-10 text-white/20 mx-auto mb-2" />
                    <p className="text-white/20 text-xs">Camera feed with MediaPipe analysis</p>
                  </div>
                  {/* Mock landmarks */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <div className="px-2 py-1 bg-green-500/20 rounded text-green-400 text-xs">Eye Contact: 94%</div>
                    <div className="px-2 py-1 bg-cyan-500/20 rounded text-cyan-400 text-xs">Posture: Good</div>
                  </div>
                </div>

                {/* Right panel */}
                <div className="flex flex-col gap-3">
                  <div className="glass-card p-3 flex-1">
                    <p className="text-white/40 text-xs mb-1">AI QUESTION</p>
                    <p className="text-white text-xs leading-relaxed">
                      "Tell me about a challenging project you built and what you learned from it."
                    </p>
                  </div>
                  <div className="glass-card p-3">
                    <p className="text-white/40 text-xs mb-2">LIVE SCORES</p>
                    {[
                      { label: 'Communication', val: 82, color: 'bg-violet-500' },
                      { label: 'Confidence', val: 74, color: 'bg-cyan-500' },
                      { label: 'Body Language', val: 88, color: 'bg-green-500' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="mb-1.5">
                        <div className="flex justify-between text-xs text-white/40 mb-0.5">
                          <span>{label}</span>
                          <span>{val}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────── */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-4xl font-bold gradient-text mb-1">{value}</div>
              <div className="text-white/40 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              What We Analyze
            </div>
            <h2 className="section-title mb-4">
              Every Dimension of
              <span className="gradient-text"> Interview Performance</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              No other platform gives you this level of detail. We go beyond just questions and answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="glass-card-hover p-6 group">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules Section ────────────────────────────────────── */}
      <section className="py-24 px-4 bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Platform Modules
            </div>
            <h2 className="section-title mb-4">
              Your Complete
              <span className="gradient-text"> Career Toolkit</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Start with Interview Judger. More modules are coming — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(({ icon: Icon, title, desc, color, active, badge }) => (
              <div
                key={title}
                className={`glass-card p-6 relative overflow-hidden transition-all duration-300 ${
                  active
                    ? 'border-violet-500/30 hover:border-violet-400/50 cursor-pointer hover:-translate-y-1'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Badge */}
                <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full ${
                  active
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-white/5 text-white/30'
                }`}>
                  {badge}
                </span>

                {/* Gradient glow */}
                {active && (
                  <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl`} />
                )}

                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>

                {active && (
                  <Link
                    to="/dashboard"
                    className="mt-4 flex items-center gap-1 text-violet-400 text-sm font-medium hover:gap-2 transition-all"
                  >
                    Try Now <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-500/10" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl" />
            <div className="relative">
              <MessageSquare className="w-14 h-14 text-violet-400 mx-auto mb-6" />
              <h2 className="section-title mb-4">
                Ready to Ace Your
                <span className="gradient-text"> Interview?</span>
              </h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Join thousands of job seekers using AI to prepare smarter, not harder.
              </p>
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
