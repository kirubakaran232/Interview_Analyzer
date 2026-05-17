import { Brain } from 'lucide-react';

const Loader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center gap-4">
    {/* Animated logo */}
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 blur-xl opacity-40 animate-pulse-slow" />
      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 animate-float">
        <Brain className="w-10 h-10 text-white" />
      </div>
    </div>

    {/* Spinner ring */}
    <div className="w-12 h-12 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />

    <p className="text-white/50 text-sm animate-pulse">{text}</p>
  </div>
);

export const InlineLoader = ({ text = '' }) => (
  <div className="flex items-center gap-3 text-white/50">
    <div className="w-5 h-5 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
    {text && <span className="text-sm">{text}</span>}
  </div>
);

export default Loader;
