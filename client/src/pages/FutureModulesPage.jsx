import { Link } from 'react-router-dom';
import { BookOpen, Code, FileText, Headphones, Users, Brain, ArrowLeft } from 'lucide-react';

const modules = [
  { title: 'Resume Analyzer', icon: FileText, description: 'ATS scoring, keyword match, and rewrite suggestions.' },
  { title: 'Aptitude Practice', icon: BookOpen, description: 'Timed quantitative, verbal, and logic practice.' },
  { title: 'Coding Interview', icon: Code, description: 'Problem solving rounds with AI hints and review.' },
  { title: 'Group Discussion Judger', icon: Users, description: 'GD simulation, leadership, and participation scoring.' },
  { title: 'Communication Trainer', icon: Headphones, description: 'Fluency, grammar, and clarity coaching.' },
  { title: 'HR Round Practice', icon: Brain, description: 'Behavioral questions and STAR-method feedback.' },
];

const FutureModulesPage = () => (
  <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
    <div className="max-w-5xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-violet-400 text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="font-display text-3xl font-bold text-white mb-2">Future Modules</h1>
      <p className="text-white/45 mb-8">
        The platform is built so each module can grow independently while sharing auth, profile, and analytics.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map(({ title, icon: Icon, description }) => (
          <div key={title} className="glass-card p-5">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-white font-semibold mb-2">{title}</h2>
            <p className="text-white/40 text-sm leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FutureModulesPage;
