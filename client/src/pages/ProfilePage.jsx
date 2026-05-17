import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';
import { User, Mail, Briefcase, Code, FileText, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DOMAINS = [
  'Software Engineering', 'Data Science', 'Frontend Development',
  'Backend Development', 'Full Stack Development', 'Machine Learning',
  'DevOps / Cloud', 'Product Management', 'Business Analyst',
  'UI/UX Design', 'Cybersecurity', 'Mobile Development',
];

const ProfilePage = () => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [form, setForm] = useState({
    displayName: userProfile?.displayName || '',
    domain: userProfile?.domain || '',
    skills: userProfile?.skills?.join(', ') || '',
    resumeText: userProfile?.resumeText || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateUserProfile({
        displayName: form.displayName,
        domain: form.domain,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        resumeText: form.resumeText,
      });
      setUserProfile(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <User className="w-7 h-7 text-violet-400" /> Profile Settings
        </h1>

        {/* Avatar */}
        <div className="glass-card p-6 mb-6 flex items-center gap-5">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="avatar" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <span className="font-display text-3xl font-bold text-white">
                {(form.displayName || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-display text-xl font-bold text-white">{form.displayName || 'User'}</p>
            <p className="text-white/40 text-sm flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" /> {currentUser?.email}
            </p>
            {userProfile?.totalSessions > 0 && (
              <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                {userProfile.totalSessions} sessions completed
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="glass-card p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="input-field pl-10"
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" /> Target Domain
            </label>
            <select
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              className="input-field"
            >
              <option value="" className="bg-navy-800">Select domain...</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d} className="bg-navy-800">{d}</option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 flex items-center gap-1.5">
              <Code className="w-4 h-4" /> Skills (comma-separated)
            </label>
            <input
              type="text"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="input-field"
              placeholder="React, Node.js, Python..."
            />
          </div>

          {/* Resume */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Resume / Project Summary
              <span className="ml-auto text-white/20 text-xs">Optional</span>
            </label>
            <textarea
              value={form.resumeText}
              onChange={(e) => setForm({ ...form, resumeText: e.target.value })}
              rows={6}
              className="input-field resize-none text-sm"
              placeholder="Paste your resume or describe your experience and projects..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 w-full justify-center disabled:opacity-50"
          >
            {saving
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save className="w-4 h-4" /> Save Profile</>
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
