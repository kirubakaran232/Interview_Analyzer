import { useEffect, useMemo, useRef, useState } from 'react';
import { Headphones, Mic, MicOff, Send, RotateCcw, History, Trophy, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  getCommunicationPrompts,
  submitCommunicationSession,
  getCommunicationHistory,
} from '../services/api';

const CommunicationTrainerPage = () => {
  const [promptMap, setPromptMap] = useState({});
  const [mode, setMode] = useState('Self Introduction');
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(null);

  const {
    transcript,
    interimTranscript,
    fullTranscript,
    isListening,
    fillerCount,
    wpm,
    wordCount,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    getCommunicationPrompts().then(({ data }) => {
      setPromptMap(data.prompts || {});
      const firstMode = Object.keys(data.prompts || {})[0] || 'Self Introduction';
      setMode(firstMode);
      setPrompt(data.prompts?.[firstMode]?.[0] || '');
    });
    getCommunicationHistory().then(({ data }) => setHistory(data.sessions || [])).catch(() => {});
  }, []);

  const prompts = useMemo(() => promptMap[mode] || [], [promptMap, mode]);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setPrompt(promptMap[nextMode]?.[0] || '');
    setResult(null);
    resetTranscript();
  };

  const start = () => {
    setResult(null);
    resetTranscript();
    startTimeRef.current = Date.now();
    startListening();
  };

  const stop = () => {
    stopListening();
  };

  const submit = async () => {
    if (!fullTranscript.trim() || wordCount < 5) return toast.error('Speak at least one complete answer first');
    stopListening();
    setSubmitting(true);
    const duration = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    try {
      const { data } = await submitCommunicationSession({
        mode,
        prompt,
        transcript: fullTranscript,
        duration,
        speechMetrics: { wpm, fillerCount, wordCount },
      });
      setResult(data.session);
      setHistory((items) => [data.session, ...items]);
    } catch {
      toast.error('Could not evaluate communication practice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
            <Headphones className="w-7 h-7 text-rose-400" /> Communication Trainer
          </h1>
          <p className="text-white/45 mt-2">Practice spoken English, HR answers, presentation clarity, and professional tone.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          <div className="space-y-5">
            <div className="glass-card p-5 space-y-4">
              <div>
                <label className="block text-white/55 text-sm mb-2">Practice mode</label>
                <select value={mode} onChange={(event) => handleModeChange(event.target.value)} className="input-field">
                  {Object.keys(promptMap).map((item) => <option key={item} className="bg-navy-800">{item}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/55 text-sm mb-2">Prompt</label>
                <select value={prompt} onChange={(event) => setPrompt(event.target.value)} className="input-field">
                  {prompts.map((item) => <option key={item} className="bg-navy-800">{item}</option>)}
                </select>
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                className="input-field resize-none text-sm"
                placeholder="Or write your own speaking prompt..."
              />

              <div className="grid grid-cols-3 gap-3">
                <Metric label="WPM" value={wpm} tone="text-amber-400" />
                <Metric label="Fillers" value={fillerCount} tone="text-green-400" />
                <Metric label="Words" value={wordCount} tone="text-cyan-400" />
              </div>

              {!isSupported && (
                <p className="text-amber-300 text-sm">Speech recognition is not supported in this browser. Try Chrome or Edge.</p>
              )}

              <div className="flex gap-3">
                {!isListening ? (
                  <button onClick={start} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Mic className="w-4 h-4" /> Start Speaking
                  </button>
                ) : (
                  <button onClick={stop} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-red-300 flex items-center justify-center gap-2">
                    <MicOff className="w-4 h-4" /> Stop
                  </button>
                )}
                <button onClick={resetTranscript} className="btn-secondary px-4">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button onClick={submit} disabled={submitting || wordCount < 5} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4" /> {submitting ? 'Evaluating...' : 'Evaluate Speech'}
              </button>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-cyan-400" /> Recent practice
              </h2>
              <div className="space-y-2">
                {history.slice(0, 5).map((item) => (
                  <button key={item._id} onClick={() => setResult(item)} className="w-full rounded-lg bg-white/[0.03] px-3 py-2 text-left">
                    <p className="text-white/70 text-sm truncate">{item.mode}</p>
                    <p className="text-white/30 text-xs">Overall {item.scores?.overall || 0}</p>
                  </button>
                ))}
                {history.length === 0 && <p className="text-white/30 text-sm">No communication sessions yet.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="glass-card p-5 min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Live Transcript</h2>
                {isListening && <span className="text-red-300 text-sm">Recording</span>}
              </div>
              {transcript || interimTranscript ? (
                <p className="text-white/75 leading-relaxed">
                  {transcript}
                  {interimTranscript && <span className="text-white/35 italic"> {interimTranscript}</span>}
                </p>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-white/30">
                  <Mic className="w-8 h-8 mb-2" />
                  <p>Your spoken answer will appear here.</p>
                </div>
              )}
            </div>

            {result && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-amber-400" /> Scores
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(result.scores || {}).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm text-white/55 mb-1">
                          <span className="capitalize">{key}</span>
                          <span>{value}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full">
                          <div className="h-2 bg-rose-500 rounded-full" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-cyan-400" /> Coaching Feedback
                  </h3>
                  <p className="text-white/65 text-sm mb-4">{result.summary}</p>
                  <p className="text-white/40 text-xs mb-2">Improvements</p>
                  {(result.improvements || []).map((item) => <p key={item} className="text-amber-300 text-sm mb-1">- {item}</p>)}
                </div>

                <div className="glass-card p-5 lg:col-span-2">
                  <h3 className="text-white font-semibold mb-3">Improved Version</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{result.correctedVersion}</p>
                </div>

                <div className="glass-card p-5 lg:col-span-2">
                  <h3 className="text-white font-semibold mb-3">Practice Plan</h3>
                  <div className="space-y-2">
                    {(result.practicePlan || []).map((item) => <p key={item} className="text-white/65 text-sm">- {item}</p>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value, tone }) => (
  <div className="rounded-xl bg-white/[0.03] p-3 text-center">
    <p className={`font-display text-xl font-bold ${tone}`}>{value}</p>
    <p className="text-white/35 text-xs">{label}</p>
  </div>
);

export default CommunicationTrainerPage;
