import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { generateQuestion, evaluateAnswer, endSession } from '../services/api';
import { computeScores } from '../utils/scoringEngine';
import {
  Mic, MicOff, Video, VideoOff, Send, Square, AlertCircle,
  Eye, Activity, MessageSquare, Clock, ChevronRight, Brain,
  Volume2, VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_QUESTIONS = 8;

const LiveInterviewPage = () => {
  const { state, dispatch } = useInterview();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const allFramesRef = useRef([]);
  const allAiEvals = useRef([]);
  const answerStartTimeRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [frameMetrics, setFrameMetrics] = useState({
    eyeContact: 0,
    postureScore: 0,
    expressionConfidence: 0,
  });
  const [isTTSOn, setIsTTSOn] = useState(true);

  // ── Speech Recognition ──────────────────────────────────────
  const {
    transcript,
    fullTranscript,
    interimTranscript,
    isListening,
    fillerCount,
    wpm,
    wordCount,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // ── MediaPipe ──────────────────────────────────────────────
  const onFrame = useCallback((metrics) => {
    setFrameMetrics(metrics);
    allFramesRef.current.push(metrics);
  }, []);

  const { start: startMediaPipe, stop: stopMediaPipe, isLoaded: mpLoaded } = useMediaPipe(videoRef, onFrame);

  // ── Camera setup ────────────────────────────────────────────
  useEffect(() => {
    const initCamera = async () => {
      if (!state.sessionId) {
        navigate('/interview/setup');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        await startMediaPipe();
        fetchNextQuestion(0);
      } catch (err) {
        toast.error('Camera access denied. Please allow camera to continue.');
      }
    };
    initCamera();

    // Session timer
    const timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);

    return () => {
      clearInterval(timer);
      stopMediaPipe();
      // Stop camera stream
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ── Fetch next question ────────────────────────────────────
  const fetchNextQuestion = async (questionIndex) => {
    setQuestionLoading(true);
    try {
      const previousQA = state.questions.map((q) => ({
        q: q.questionText,
        a: q.transcript,
      }));

      const { data } = await generateQuestion({
        sessionId: state.sessionId,
        domain: state.domain,
        skills: state.skills,
        difficulty: state.difficulty,
        resumeText: state.resumeText,
        previousQA,
        questionNumber: questionIndex + 1,
      });

      const newQuestion = {
        questionText: data.question,
        questionType: data.type || 'General',
        transcript: '',
        metrics: {},
      };

      dispatch({ type: 'ADD_QUESTION', payload: newQuestion });
      setCurrentQuestion(newQuestion);

      // Text-to-speech
      if (isTTSOn && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.question);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }

      answerStartTimeRef.current = Date.now();
      resetTranscript();
      startListening();
    } catch (err) {
      toast.error('Failed to get next question. Retrying...');
    } finally {
      setQuestionLoading(false);
    }
  };

  // ── Submit answer ──────────────────────────────────────────
  const submitAnswer = async () => {
    if (!fullTranscript.trim() && wordCount < 5) {
      return toast.error('Please speak your answer first');
    }
    stopListening();
    setSubmitting(true);

    const duration = Math.round((Date.now() - answerStartTimeRef.current) / 1000);
    const currentFrames = [...allFramesRef.current];
    allFramesRef.current = [];

    try {
      // Evaluate answer with AI
      const { data: evalData } = await evaluateAnswer({
        sessionId: state.sessionId,
        questionIndex: state.currentQuestionIndex,
        questionText: currentQuestion.questionText,
        transcript: fullTranscript,
        domain: state.domain,
        fillerCount,
        wpm,
        duration,
      });

      allAiEvals.current.push(evalData.evaluation || {});

      dispatch({
        type: 'UPDATE_QUESTION',
        payload: {
          index: state.currentQuestionIndex,
          data: {
            transcript: fullTranscript,
            fillerWords: fillerCount,
            speakingSpeed: wpm,
            duration,
            metrics: currentFrames,
          },
        },
      });
      dispatch({ type: 'ADD_BL_FRAME', payload: currentFrames });
      dispatch({ type: 'NEXT_QUESTION' });

      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex < MAX_QUESTIONS) {
        await fetchNextQuestion(nextIndex);
      } else {
        await finishInterview();
      }
    } catch (err) {
      toast.error('Error processing answer');
      startListening();
    } finally {
      setSubmitting(false);
    }
  };

  // ── Finish interview ───────────────────────────────────────
  const finishInterview = async () => {
    setEnding(true);
    stopListening();
    stopMediaPipe();

    // Aggregate AI evals
    const avgAiEval = allAiEvals.current.length > 0
      ? {
          answerRelevance: avg(allAiEvals.current.map((e) => e.answerRelevance || 70)),
          grammarScore: avg(allAiEvals.current.map((e) => e.grammarScore || 70)),
          clarityScore: avg(allAiEvals.current.map((e) => e.clarityScore || 70)),
          technicalAccuracy: avg(allAiEvals.current.map((e) => e.technicalAccuracy || 70)),
        }
      : {};

    // Compute final scores
    const scores = computeScores({
      blFrames: state.bodyLanguageFrames.flat(),
      speechData: { fillerCount, wpm },
      aiEval: avgAiEval,
      questionCount: state.questions.length,
    });

    const allSuggestions = allAiEvals.current.flatMap((e) => e.suggestions || []).slice(0, 8);

    try {
      await endSession(state.sessionId, {
        questions: state.questions,
        scores,
        suggestions: allSuggestions,
        bodyLanguageData: {
          eyeContactPercent: frameMetrics.eyeContact,
          postureScore: frameMetrics.postureScore,
          expressionSummary: frameMetrics.expressionConfidence > 70 ? 'Confident' : 'Needs improvement',
        },
        duration: elapsedTime,
      });

      dispatch({ type: 'SET_SCORES', payload: scores });
      dispatch({ type: 'SET_SUGGESTIONS', payload: allSuggestions });
      dispatch({ type: 'SET_STATUS', payload: 'ended' });

      navigate(`/results/${state.sessionId}`);
    } catch (err) {
      toast.error('Failed to save session. Redirecting...');
      navigate('/dashboard');
    } finally {
      setEnding(false);
    }
  };

  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const progressPct = Math.round((state.currentQuestionIndex / MAX_QUESTIONS) * 100);

  if (!state.sessionId) return null;

  return (
    <div className="min-h-screen bg-navy-950 pt-16">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-white/5 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Session info */}
          <div className="flex items-center gap-2 mr-auto">
            <span className="status-dot-active" />
            <span className="text-white/60 text-sm hidden sm:block">{state.domain} Interview</span>
            <span className="text-white/30 text-xs hidden md:block">• {state.difficulty}</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm whitespace-nowrap">
              Q {Math.min(state.currentQuestionIndex + 1, MAX_QUESTIONS)}/{MAX_QUESTIONS}
            </span>
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-white/50 text-sm">
            <Clock className="w-4 h-4" />
            {formatTime(elapsedTime)}
          </div>

          {/* End button */}
          <button
            onClick={finishInterview}
            disabled={ending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            <Square className="w-3.5 h-3.5" />
            {ending ? 'Ending...' : 'End'}
          </button>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="pt-14 max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-160px)]">

          {/* ── Left: Camera + Metrics ─────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Camera Feed */}
            <div className="relative bg-navy-800 rounded-2xl overflow-hidden flex-1 border border-white/5 min-h-[240px]">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover ${!cameraOn ? 'invisible' : ''}`}
              />

              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <VideoOff className="w-10 h-10 text-white/20 mb-2" />
                  <p className="text-white/30 text-sm">Camera off</p>
                </div>
              )}

              {/* Overlay controls */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCameraOn(!cameraOn)}
                    className={`p-2 rounded-lg backdrop-blur-md border transition-all ${
                      cameraOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/20 border-red-500/30 text-red-400'
                    }`}
                  >
                    {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setMicOn(!micOn);
                      micOn ? stopListening() : startListening();
                    }}
                    className={`p-2 rounded-lg backdrop-blur-md border transition-all ${
                      micOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/20 border-red-500/30 text-red-400'
                    }`}
                  >
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsTTSOn(!isTTSOn)}
                    className={`p-2 rounded-lg backdrop-blur-md border transition-all ${
                      isTTSOn ? 'bg-white/10 border-white/20 text-white' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {isTTSOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                {isListening && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/30">
                    <span className="w-2 h-2 bg-red-400 rounded-full recording-indicator" />
                    <span className="text-red-400 text-xs font-medium">Recording</span>
                  </div>
                )}
              </div>

              {/* MediaPipe status */}
              {!mpLoaded && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md">
                  <div className="w-3 h-3 border border-white/30 border-t-violet-400 rounded-full animate-spin" />
                  <span className="text-white/50 text-xs">Loading AI...</span>
                </div>
              )}
            </div>

            {/* Live Body Language Metrics */}
            <div className="glass-card p-4 space-y-3">
              <p className="text-white/40 text-xs font-medium flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> LIVE BODY LANGUAGE
              </p>
              {[
                { label: 'Eye Contact', value: Math.round(frameMetrics.eyeContact), color: 'bg-violet-500' },
                { label: 'Posture', value: Math.round(frameMetrics.postureScore), color: 'bg-cyan-500' },
                { label: 'Confidence', value: Math.round(frameMetrics.expressionConfidence), color: 'bg-green-500' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>{label}</span>
                    <span className={value >= 70 ? 'text-green-400' : value >= 50 ? 'text-amber-400' : 'text-red-400'}>
                      {value}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-300`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Speech Metrics */}
            <div className="glass-card p-4">
              <p className="text-white/40 text-xs font-medium flex items-center gap-1.5 mb-3">
                <Activity className="w-3.5 h-3.5" /> SPEECH METRICS
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className={`font-display text-xl font-bold ${wpm >= 120 && wpm <= 160 ? 'text-green-400' : 'text-amber-400'}`}>
                    {wpm}
                  </div>
                  <div className="text-white/30 text-xs">WPM</div>
                </div>
                <div className="text-center">
                  <div className={`font-display text-xl font-bold ${fillerCount <= 2 ? 'text-green-400' : fillerCount <= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                    {fillerCount}
                  </div>
                  <div className="text-white/30 text-xs">Fillers</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-xl font-bold text-cyan-400">{wordCount}</div>
                  <div className="text-white/30 text-xs">Words</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Question + Transcript ────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Question */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span className="text-violet-400 text-xs font-medium">AI INTERVIEWER</span>
                  {currentQuestion?.questionType && (
                    <span className="ml-auto px-2 py-0.5 bg-violet-500/10 rounded-full text-violet-400/70 text-xs border border-violet-500/20">
                      {currentQuestion.questionType}
                    </span>
                  )}
                </div>

                {questionLoading ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-white/40 text-sm">AI is thinking...</span>
                  </div>
                ) : (
                  <p className="text-white text-lg leading-relaxed font-medium">
                    {currentQuestion?.questionText || 'Preparing your interview...'}
                  </p>
                )}
              </div>
            </div>

            {/* Transcript */}
            <div className="glass-card p-5 flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="text-white/40 text-xs font-medium">YOUR ANSWER</span>
                {isListening && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-400 rounded-full recording-indicator" />
                    <span className="text-red-400 text-xs">Listening</span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {!isSupported ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                    <p className="text-white/50 text-sm">
                      Speech recognition not supported in your browser.
                      Use Chrome or Edge for the best experience.
                    </p>
                  </div>
                ) : (
                  <div className="min-h-full">
                    {transcript || interimTranscript ? (
                      <p className="text-white/80 text-base leading-relaxed">
                        {transcript}
                        {interimTranscript && (
                          <span className="text-white/30 italic"> {interimTranscript}</span>
                        )}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 gap-2">
                        <Mic className="w-8 h-8 text-white/10" />
                        <p className="text-white/30 text-sm text-center">
                          Start speaking — your answer will appear here live
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {!isListening ? (
                <button
                  onClick={startListening}
                  disabled={questionLoading}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Mic className="w-4 h-4" /> Start Answering
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
                >
                  <MicOff className="w-4 h-4" /> Stop Recording
                </button>
              )}

              <button
                id="submit-answer-btn"
                onClick={submitAnswer}
                disabled={submitting || questionLoading || (!transcript && wordCount < 3)}
                className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : state.currentQuestionIndex >= MAX_QUESTIONS - 1 ? (
                  <>Finish <Square className="w-4 h-4" /></>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {/* Tips */}
            {isListening && (
              <div className="glass-card p-3 flex items-start gap-2 border-cyan-500/20">
                <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/40 text-xs leading-relaxed">
                  <strong className="text-cyan-400">Tips:</strong> Maintain eye contact with the camera.
                  Speak clearly at 120–160 WPM. Avoid filler words like "um" and "uh".
                  Structure your answer clearly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInterviewPage;
