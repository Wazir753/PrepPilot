import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function useSpeech({ continuous = true, language = 'en-US' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) return;
    SpeechRecognition.startListening({ continuous, language });
    setIsListening(true);
  }, [browserSupportsSpeechRecognition, continuous, language]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (listening) stopListening();
    else startListening();
  }, [listening, startListening, stopListening]);

  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  return {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}
