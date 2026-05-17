import { useRef, useState, useCallback, useEffect } from 'react';
import { detectFillerWords, countWords } from '../utils/fillerWordDetector';

/**
 * useSpeechRecognition — Web Speech API hook for live transcription.
 * Tracks filler words, word count, and WPM automatically.
 */
export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const shouldKeepListeningRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        if (!startTimeRef.current) startTimeRef.current = Date.now();
      };

      recognition.onend = () => {
        setIsListening(false);

        // Chrome may end a recognition session after a short silence even with
        // continuous mode enabled. Restart until the user explicitly stops.
        if (shouldKeepListeningRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            try {
              recognition.start();
            } catch {
              // The browser can still be finishing the previous session.
            }
          }, 250);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          shouldKeepListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += text + ' ';
            finalTranscriptRef.current = final;
          } else {
            interim += text;
          }
        }

        const fullText = final + interim;
        setTranscript(final.trim());
        setInterimTranscript(interim);

        // Compute WPM
        const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60; // minutes
        const words = countWords(fullText);
        setWordCount(words);
        if (elapsed > 0) setWpm(Math.round(words / elapsed));

        // Detect filler words
        const fillers = detectFillerWords(fullText);
        setFillerCount(fillers);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    shouldKeepListeningRef.current = true;
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setFillerCount(0);
    setWpm(0);
    setWordCount(0);
    startTimeRef.current = Date.now();
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Recognition already started');
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    startTimeRef.current = null;
    setTranscript('');
    setInterimTranscript('');
    setFillerCount(0);
    setWpm(0);
    setWordCount(0);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    fullTranscript: transcript + (interimTranscript ? ' ' + interimTranscript : ''),
    isListening,
    fillerCount,
    wpm,
    wordCount,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};
