import axios from 'axios';
import { auth } from './firebase';

// Base URL: uses Vite proxy in dev, env var in production
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global errors
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const isUnauthorized = err.response?.status === 401;
    const user = auth.currentUser;

    // Firebase can refresh tokens transparently. Retry once before treating a 401 as final.
    if (isUnauthorized && user && !originalRequest?._retry) {
      originalRequest._retry = true;
      const token = await user.getIdToken(true);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    }

    // Do not force navigation here. ProtectedRoute should react to real Firebase sign-out,
    // while ordinary API failures stay local to the screen that made the request.
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────
export const verifyUser = (userData) => api.post('/auth/verify', userData);

// ─── User ────────────────────────────────────────────────────
export const getUserProfile = () => api.get('/user/profile');
export const updateUserProfile = (data) => api.put('/user/profile', data);

// ─── Interview Sessions ─────────────────────────────────────
export const startSession = (data) => api.post('/interview/start', data);
export const endSession = (id, data) => api.put(`/interview/${id}/end`, data);
export const getSessionHistory = () => api.get('/interview/history');
export const getSessionById = (id) => api.get(`/interview/${id}`);

// ─── AI Question Generation ──────────────────────────────────
export const generateQuestion = (data) => api.post('/questions/generate', data);

// ─── AI Answer Evaluation ────────────────────────────────────
export const evaluateAnswer = (data) => api.post('/evaluation/answer', data);
export const getSessionEvaluation = (sessionId) => api.get(`/evaluation/${sessionId}`);

// Resume Analyzer
export const analyzeResume = (formData) =>
  api.post('/resume/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getResumeHistory = () => api.get('/resume/history');
export const getResumeAnalysisById = (id) => api.get(`/resume/${id}`);

// Coding Interview
export const startCodingSession = (data) => api.post('/coding/sessions', data);
export const requestCodingHint = (id, data) => api.post(`/coding/sessions/${id}/hint`, data);
export const submitCodingSession = (id, data) => api.post(`/coding/sessions/${id}/submit`, data);
export const getCodingHistory = () => api.get('/coding/sessions/history');
export const getRoadmap = () => api.get('/coding/roadmap');
export const updateRoadmapStatus = (problemId, data) => api.put(`/coding/roadmap/${problemId}`, data);
export const getDailyPlan = () => api.get('/coding/daily-plan');

// Aptitude Practice
export const getAptitudeCatalog = () => api.get('/aptitude/catalog');
export const generateAptitudeQuestion = (data) => api.post('/aptitude/questions/generate', data);
export const submitAptitudeAttempt = (data) => api.post('/aptitude/attempts', data);
export const getAptitudeHistory = () => api.get('/aptitude/history');
export const getAptitudeSummary = () => api.get('/aptitude/summary');
export const startAptitudeMockTest = (data) => api.post('/aptitude/mock-tests', data);
export const submitAptitudeMockTest = (id, data) => api.post(`/aptitude/mock-tests/${id}/submit`, data);
export const getAptitudeMockHistory = () => api.get('/aptitude/mock-tests/history');

export default api;
