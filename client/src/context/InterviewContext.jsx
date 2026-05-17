import { createContext, useContext, useReducer, useRef } from 'react';

const InterviewContext = createContext(null);

const initialState = {
  // Session metadata
  sessionId: null,
  domain: '',
  skills: [],
  difficulty: 'intermediate',
  resumeText: '',

  // Interview flow
  status: 'idle', // idle | setup | running | paused | ended
  currentQuestionIndex: 0,
  questions: [],          // [{ questionText, questionType, transcript, metrics }]

  // Live transcription
  currentTranscript: '',
  isListening: false,

  // MediaPipe body language data (accumulated per answer)
  bodyLanguageFrames: [],  // array of frame snapshots

  // Aggregated session scores
  scores: null,

  // Suggestions from AI
  suggestions: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SETUP':
      return { ...state, ...action.payload };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'ADD_QUESTION':
      return { ...state, questions: [...state.questions, action.payload] };
    case 'UPDATE_QUESTION': {
      const updated = state.questions.map((q, i) =>
        i === action.payload.index ? { ...q, ...action.payload.data } : q
      );
      return { ...state, questions: updated };
    }
    case 'NEXT_QUESTION':
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
    case 'SET_TRANSCRIPT':
      return { ...state, currentTranscript: action.payload };
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'ADD_BL_FRAME':
      return { ...state, bodyLanguageFrames: [...state.bodyLanguageFrames, action.payload] };
    case 'CLEAR_BL_FRAMES':
      return { ...state, bodyLanguageFrames: [] };
    case 'SET_SCORES':
      return { ...state, scores: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
};

export const InterviewProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Refs for real-time data that doesn't need re-renders
  const recognitionRef = useRef(null);
  const mediapipeRef = useRef(null);
  const timerRef = useRef(null);

  return (
    <InterviewContext.Provider value={{ state, dispatch, recognitionRef, mediapipeRef, timerRef }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider');
  return ctx;
};
