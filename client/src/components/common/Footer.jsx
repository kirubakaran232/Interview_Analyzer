import { Brain, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">
                AI Career <span className="gradient-text">Coach</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Practice interviews with real AI feedback. Improve your body language, communication, and confidence — all from your browser.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white/80 font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Interview Judger', to: '/interview/setup' },
                { label: 'History', to: '/history' },
                { label: 'Profile', to: '/profile' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h4 className="text-white/80 font-semibold text-sm mb-3">Modules</h4>
            <ul className="space-y-2">
              {[
                'Interview Judger',
                'Resume Analyzer',
                'Aptitude Practice',
                'Coding Interview',
                'Communication Trainer',
              ].map((label) => (
                <li key={label}>
                  <span className="text-white/30 text-sm">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © 2025 AI Career Coach. Made with <Heart className="inline w-3 h-3 text-red-400" /> for job seekers.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white/30 hover:text-white/60 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="text-white/30 hover:text-white/60 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-white/30 hover:text-white/60 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
