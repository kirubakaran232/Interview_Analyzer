import { useEffect, useState } from 'react';
import { FileText, Upload, Target, Sparkles, CheckCircle, XCircle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeResume, getResumeHistory } from '../services/api';

const ResumeAnalyzerPage = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getResumeHistory().then(({ data }) => setHistory(data.analyses || [])).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!file) return toast.error('Upload a PDF or DOCX resume first');
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    setLoading(true);
    try {
      const { data } = await analyzeResume(formData);
      setAnalysis(data.analysis);
      setHistory((items) => [data.analysis, ...items]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Resume analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const sectionEntries = analysis ? Object.entries(analysis.sectionScores) : [];

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-pink-400" /> Resume Analyzer
          </h1>
          <p className="text-white/45 mt-2">Upload a resume, paste a job description, and get an ATS-focused report.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-5">
            <div className="glass-card p-5">
              <label className="block text-white/60 text-sm mb-2">Resume file</label>
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-center hover:border-pink-400/50">
                <Upload className="w-7 h-7 text-pink-400 mb-2" />
                <span className="text-white/70 text-sm">{file ? file.name : 'Upload PDF or DOCX'}</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="glass-card p-5">
              <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Job description
              </label>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={10}
                className="input-field resize-none text-sm"
                placeholder="Paste the job description here..."
              />
              <button onClick={handleAnalyze} disabled={loading} className="btn-primary w-full mt-4">
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-cyan-400" /> Recent analyses
              </h2>
              <div className="space-y-2">
                {history.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                    <span className="truncate text-white/60 text-sm">{item.fileName}</span>
                    <span className="text-pink-400 text-sm">{item.atsScore}</span>
                  </div>
                ))}
                {history.length === 0 && <p className="text-white/30 text-sm">No reports yet.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {!analysis ? (
              <div className="glass-card p-10 text-center text-white/35">
                Your ATS report will appear here after analysis.
              </div>
            ) : (
              <>
                <div className="glass-card p-6 flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="w-28 h-28 rounded-full border-8 border-pink-500/20 flex items-center justify-center">
                    <span className="font-display text-4xl font-bold text-pink-400">{analysis.atsScore}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl font-bold text-white">ATS Score / 100</h2>
                    <p className="text-white/55 mt-2">{analysis.summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-4">Section-wise score</h3>
                    <div className="space-y-3">
                      {sectionEntries.map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm text-white/55 mb-1">
                            <span>{key}</span>
                            <span>{value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5">
                            <div className="h-2 rounded-full bg-pink-500" style={{ width: `${value * 5}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-4">Checklist</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(analysis.checks).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {value ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                          <span className="text-white/65">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-3">Missing skills and keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...(analysis.missingSkills || []), ...(analysis.missingKeywords || [])].map((item) => (
                        <span key={item} className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-300 text-xs border border-red-500/20">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Suggestions
                    </h3>
                    <div className="space-y-2 text-sm text-white/65">
                      {(analysis.suggestions || []).map((item) => <p key={item}>{item}</p>)}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold mb-3">Improved bullet points</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    {(analysis.improvedBullets || []).map((item) => <p key={item}>- {item}</p>)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
