import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import interviewService from '../services/interviewService';
import websocketService from '../services/websocketService';
import { WS_EVENTS } from '../utils/constants';
import { parseError } from '../utils/helpers';

export const InterviewContext = createContext(null);

const initialMetrics = {
  emotion: 'neutral',
  eyeContact: 0,
  speakingSpeed: 0,
  fillerWords: 0,
  confidence: 0,
};

export function InterviewProvider({ children }) {
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setupWsListeners = useCallback((interviewId) => {
    websocketService.connect();
    websocketService.joinInterview(interviewId);

    const unsubQuestion = websocketService.on(WS_EVENTS.INTERVIEW_QUESTION, (data) => {
      setCurrentQuestion(data);
    });

    const unsubFeedback = websocketService.on(WS_EVENTS.INTERVIEW_FEEDBACK, (data) => {
      setFeedback(data);
    });

    const unsubEmotion = websocketService.on(WS_EVENTS.EMOTION_UPDATE, (data) => {
      setMetrics((m) => ({ ...m, emotion: data.emotion, eyeContact: data.eye_contact }));
    });

    const unsubVoice = websocketService.on(WS_EVENTS.VOICE_METRICS, (data) => {
      setMetrics((m) => ({
        ...m,
        speakingSpeed: data.speaking_speed,
        fillerWords: data.filler_words,
        confidence: data.confidence,
      }));
    });

    return () => {
      unsubQuestion();
      unsubFeedback();
      unsubEmotion();
      unsubVoice();
    };
  }, []);

  const startInterview = useCallback(
    async (config) => {
      setLoading(true);
      setError(null);
      try {
        const data = await interviewService.create(config);
        setInterview(data);
        setIsLive(true);
        startTimer();
        const cleanup = setupWsListeners(data.id);
        const question = await interviewService.getNextQuestion(data.id);
        setCurrentQuestion(question);
        return { data, cleanup };
      } catch (err) {
        const msg = parseError(err);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [startTimer, setupWsListeners]
  );

  const loadInterview = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await interviewService.getById(id);
      setInterview(data);
      const existingResponses = await interviewService.listResponses(id);
      setResponses(existingResponses || []);
      if (data.status === 'in_progress') {
        setIsLive(true);
        startTimer();
        setupWsListeners(id);
        const question = await interviewService.getNextQuestion(id);
        setCurrentQuestion(question);
      }
      return data;
    } catch (err) {
      const msg = parseError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [startTimer, setupWsListeners]);

  const submitAnswer = useCallback(
    async (answer, audioUrl = null) => {
      if (!interview || !currentQuestion) return null;
      setLoading(true);
      try {
        const payload = {
          question_number: currentQuestion.question_number,
          question_text: currentQuestion.question_text,
          answer_text: answer,
          audio_url: audioUrl,
          response_time_seconds: elapsedSeconds,
        };
        const saved = await interviewService.submitResponse(interview.id, payload);
        websocketService.sendResponse(interview.id, payload);

        const evaluated = await interviewService.evaluateResponse(saved.id, {
          answer_text: answer,
          question_text: currentQuestion.question_text,
          role: interview.role,
          difficulty: interview.difficulty,
        });
        setResponses((prev) => [...prev, evaluated]);
        setFeedback(evaluated.ai_feedback || evaluated);

        const previousScore = evaluated.score ?? evaluated.technical_score;
        const next = await interviewService.getNextQuestion(interview.id, previousScore);
        setCurrentQuestion(next);
        setTranscript('');
        return evaluated;
      } catch (err) {
        const msg = parseError(err);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [interview, currentQuestion, elapsedSeconds]
  );

  const endInterview = useCallback(async () => {
    if (!interview) return null;
    stopTimer();
    setLoading(true);
    try {
      websocketService.endInterview(interview.id);
      const data = await interviewService.endInterview(interview.id, elapsedSeconds);
      setInterview(data);
      setIsLive(false);
      websocketService.disconnect();
      return data;
    } catch (err) {
      const msg = parseError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [interview, stopTimer]);

  const resetInterview = useCallback(() => {
    stopTimer();
    setInterview(null);
    setCurrentQuestion(null);
    setResponses([]);
    setTranscript('');
    setMetrics(initialMetrics);
    setIsLive(false);
    setFeedback(null);
    setElapsedSeconds(0);
    setError(null);
    websocketService.disconnect();
  }, [stopTimer]);

  const value = useMemo(
    () => ({
      interview,
      currentQuestion,
      responses,
      transcript,
      setTranscript,
      metrics,
      isLive,
      loading,
      error,
      feedback,
      elapsedSeconds,
      startInterview,
      loadInterview,
      submitAnswer,
      endInterview,
      resetInterview,
      setError,
    }),
    [
      interview,
      currentQuestion,
      responses,
      transcript,
      metrics,
      isLive,
      loading,
      error,
      feedback,
      elapsedSeconds,
      startInterview,
      loadInterview,
      submitAnswer,
      endInterview,
      resetInterview,
    ]
  );

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>;
}

InterviewProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
