import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { startSession } from '../services/api';
import {
  Brain, ChevronRight, ChevronLeft, Briefcase, Code, Star,
  Plus, X, FileText, Settings, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const DOMAINS = [
  'Software Engineering', 'Data Science', 'Frontend Development',
  'Backend Development', 'Full Stack Development', 'Machine Learning',
  'DevOps / Cloud', 'Product Management', 'Business Analyst',
  'UI/UX Design', 'Cybersecurity', 'Mobile Development',
];

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++',
  'MongoDB', 'SQL', 'Machine Learning', 'Docker', 'AWS', 'Git',
  'TypeScript', 'REST APIs', 'GraphQL', 'System Design', 'Agile',
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner', desc: 'College student / Fresher', color: 'from-green-600 to-emerald-500' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years experience', color: 'from-amber-500 to-orange-500' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years / Senior role', color: 'from-violet-600 to-pink-600' },
];

const InterviewSetupPage = () => {
  const { userProfile } = useAuth();
  const { dispatch } = useInterview();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [setup, setSetup] = useState({
    domain: userProfile?.domain || '',
    skills: userProfile?.skills || [],
    difficulty: 'intermediate',
    resumeText: userProfile?.resumeText || '',
    customSkill: '',
  });

  const addSkill = (skill) => {
    if (setup.skills.includes(skill) || setup.skills.length >= 10) return;
    setSetup((s) => ({ ...s, skills: [...s.skills, skill] }));
  };

  const removeSkill = (skill) =>
    setSetup((s) => ({ ...s, skills: s.skills.filter((sk) => sk !== skill) }));

  const addCustomSkill = () => {
    const trimmed = setup.customSkill.trim();
    if (!trimmed) return;
    addSkill(trimmed);
    setSetup((s) => ({ ...s, customSkill: '' }));
  };

  const handleStart = async () => {
    if (!setup.domain) return toast.error('Please select a domain');
    if (setup.skills.length === 0) return toast.error('Add at least one skill');
    setLoading(true);
    try {
      const { data } = await startSession({
        domain: setup.domain,
        skills: setup.skills,
        difficulty: setup.difficulty,
        resumeText: setup.resumeText,
      });
      dispatch({
        type: 'SET_SETUP',
        payload: {
          sessionId: data.session._id,
          domain: setup.domain,
          skills: setup.skills,
          difficulty: setup.difficulty,
          resumeText: setup.resumeText,
        },
      });
      dispatch({ type: 'SET_STATUS', payload: 'running' });
      navigate('/interview/live');
    } catch (err) {
      toast.error('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Domain' },
    { num: 2, label: 'Skills' },
    { num: 3, label: 'Difficulty' },
    { num: 4, label: 'Resume' },
  ];

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <Brain className="w-4 h-4" /> Interview Judger
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Set Up Your Interview</h1>
          <p className="text-white/50 text-sm">Customize your AI interviewer to match your target role</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map(({ num, label }, idx) => (
            <div key={num} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => num < step && setStep(num)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === num
                      ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/30'
                      : step > num
                      ? 'bg-green-500/20 text-green-400 cursor-pointer'
                      : 'bg-white/5 text-white/30'
                  }`}
                >
                  {step > num ? <CheckCircle className="w-4 h-4" /> : num}
                </button>
                <span className={`text-xs font-medium transition-colors ${step === num ? 'text-violet-400' : 'text-white/30'}`}>
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 h-px mb-5 transition-colors ${step > num ? 'bg-violet-500/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="glass-card p-8 animate-slide-up">
          {/* STEP 1: Domain */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-violet-400" />
                <h2 className="font-display text-xl font-bold text-white">Choose Your Domain</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    onClick={() => setSetup((s) => ({ ...s, domain }))}
                    className={`px-3 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                      setup.domain === domain
                        ? 'bg-violet-600/30 border border-violet-500/60 text-violet-300'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white/80'
                    }`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Skills */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Code className="w-5 h-5 text-cyan-400" />
                <h2 className="font-display text-xl font-bold text-white">Your Skills</h2>
                <span className="ml-auto text-white/30 text-sm">{setup.skills.length}/10</span>
              </div>

              {/* Selected skills */}
              {setup.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                  {setup.skills.map((skill) => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-sm">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Common skills */}
              <p className="text-white/40 text-xs mb-3">Click to add:</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {COMMON_SKILLS.filter((s) => !setup.skills.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-sm hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300 transition-all"
                  >
                    + {skill}
                  </button>
                ))}
              </div>

              {/* Custom skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={setup.customSkill}
                  onChange={(e) => setSetup((s) => ({ ...s, customSkill: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                  placeholder="Add custom skill..."
                  className="input-field flex-1 text-sm"
                />
                <button onClick={addCustomSkill} className="btn-secondary px-4 py-2 text-sm">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Difficulty */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-amber-400" />
                <h2 className="font-display text-xl font-bold text-white">Difficulty Level</h2>
              </div>
              <div className="space-y-3">
                {DIFFICULTIES.map(({ value, label, desc, color }) => (
                  <button
                    key={value}
                    onClick={() => setSetup((s) => ({ ...s, difficulty: value }))}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 border flex items-center gap-4 ${
                      setup.difficulty === value
                        ? 'border-violet-500/50 bg-violet-500/10'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{label}</p>
                      <p className="text-white/40 text-sm">{desc}</p>
                    </div>
                    {setup.difficulty === value && (
                      <CheckCircle className="w-5 h-5 text-violet-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Resume */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-400" />
                <h2 className="font-display text-xl font-bold text-white">Resume / Project Summary</h2>
                <span className="ml-auto text-white/30 text-xs bg-white/5 px-2 py-0.5 rounded-full">Optional</span>
              </div>
              <p className="text-white/40 text-sm mb-5">
                Paste your resume or describe your projects. The AI will ask domain-specific questions based on this.
              </p>
              <textarea
                value={setup.resumeText}
                onChange={(e) => setSetup((s) => ({ ...s, resumeText: e.target.value }))}
                placeholder="Example: I am a final year CSE student. I built an e-commerce website using React and Node.js with payment integration. I also worked on a machine learning project for sentiment analysis..."
                rows={8}
                className="input-field text-sm resize-none"
              />
              <p className="text-white/20 text-xs mt-2 text-right">
                {setup.resumeText.length} characters
              </p>

              {/* Summary of selections */}
              <div className="mt-5 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <p className="text-white/40 text-xs font-medium mb-3 flex items-center gap-1">
                  <Settings className="w-3 h-3" /> INTERVIEW SUMMARY
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/30">Domain:</span>
                    <span className="text-white/80 ml-2">{setup.domain}</span>
                  </div>
                  <div>
                    <span className="text-white/30">Difficulty:</span>
                    <span className="text-white/80 ml-2 capitalize">{setup.difficulty}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/30">Skills:</span>
                    <span className="text-white/80 ml-2">{setup.skills.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="flex-1" />
            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 1 && !setup.domain) return toast.error('Select a domain first');
                  if (step === 2 && setup.skills.length === 0) return toast.error('Add at least one skill');
                  setStep((s) => s + 1);
                }}
                className="btn-primary flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="start-interview-btn"
                onClick={handleStart}
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Start Interview
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupPage;
