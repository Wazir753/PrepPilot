import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import SpeechRecognition from 'react-speech-recognition';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import InterviewTimer from '../components/interview/InterviewTimer';
import QuestionCard from '../components/interview/QuestionCard';
import VideoFeed from '../components/interview/VideoFeed';
import EmotionIndicator from '../components/interview/EmotionIndicator';
import VoiceMetrics from '../components/interview/VoiceMetrics';
import TranscriptPanel from '../components/interview/TranscriptPanel';
import AIInterviewer from '../components/interview/AIInterviewer';
import InterviewControls from '../components/interview/InterviewControls';
import FeedbackOverlay from '../components/interview/FeedbackOverlay';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import useInterview from '../hooks/useInterview';
import useSpeech from '../hooks/useSpeech';
import { ROUTES } from '../utils/constants';

function LiveInterview() {
  const { id } = useParams();
  const history = useHistory();
  const {
    interview,
    currentQuestion,
    responses,
    metrics,
    feedback,
    elapsedSeconds,
    loading,
    loadInterview,
    submitAnswer,
    endInterview,
    setTranscript,
  } = useInterview();

  const {
    transcript,
    interimTranscript,
    isListening,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeech();

  const [answer, setAnswer] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (id && !initialized) {
      loadInterview(id).then(() => setInitialized(true)).catch((err) => {
        toast.error(err.message);
        history.push(ROUTES.DASHBOARD);
      });
    }
  }, [id, initialized, loadInterview, history]);

  useEffect(() => {
    setTranscript(transcript);
  }, [transcript, setTranscript]);

  const handleSubmit = async () => {
    const text = answer || transcript;
    if (!text.trim()) {
      toast.error('Please provide an answer');
      return;
    }
    try {
      stopListening();
      await submitAnswer(text);
      setAnswer('');
      resetTranscript();
      toast.success('Answer submitted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEnd = async () => {
    if (!window.confirm('End this interview?')) return;
    try {
      stopListening();
      const result = await endInterview();
      toast.success('Interview completed!');
      history.push(`${ROUTES.ANALYTICS}?interview=${result.id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!initialized || (loading && !interview)) {
    return (
      <AppLayout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen pt-16 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-display font-bold">{interview?.role} Interview</h1>
              <p className="text-sm text-gray-400">Question {responses.length + 1}</p>
            </div>
            <InterviewTimer seconds={elapsedSeconds} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <QuestionCard question={currentQuestion} index={responses.length} />
              <div className="glass rounded-xl p-4">
                <textarea
                  className="w-full bg-transparent text-white placeholder-gray-500 resize-none h-24 focus:outline-none"
                  placeholder="Type your answer or use the microphone..."
                  value={answer || transcript}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleSubmit} loading={loading}>Submit Answer</Button>
                </div>
              </div>
              <TranscriptPanel transcript={transcript} interimTranscript={interimTranscript} />
            </div>

            <div className="space-y-4">
              <VideoFeed />
              <AIInterviewer isSpeaking={isListening} />
              <EmotionIndicator emotion={metrics.emotion} eyeContact={metrics.eyeContact} />
              <VoiceMetrics
                speakingSpeed={metrics.speakingSpeed}
                fillerWords={metrics.fillerWords}
                confidence={metrics.confidence}
              />
            </div>
          </div>

          <div className="mt-6">
            <InterviewControls
              isListening={isListening}
              onToggleMic={isListening ? stopListening : startListening}
              onSkip={handleSubmit}
              onEnd={handleEnd}
              loading={loading}
              micSupported={browserSupportsSpeechRecognition}
            />
          </div>
        </div>
      </div>
      <FeedbackOverlay feedback={feedback} />
    </AppLayout>
  );
}

export default SpeechRecognition(LiveInterview);
