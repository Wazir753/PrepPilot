import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import ProgressBar from '../components/common/ProgressBar';
import interviewService from '../services/interviewService';
import { formatDuration, formatDate, parseError, downloadBlob, capitalize } from '../utils/helpers';
import { fadeInUp } from '../utils/animations';

function InterviewReplay() {
  const { id } = useParams();
  const [replay, setReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    interviewService
      .getReplay(id)
      .then(setReplay)
      .catch((err) => toast.error(parseError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (playing && replay?.segments) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((i) => {
          if (i >= replay.segments.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 3000);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, replay]);

  const handleDownload = async () => {
    try {
      const blob = await interviewService.downloadReport(id);
      downloadBlob(blob, `preppilot-report-${id}.pdf`);
      toast.success('Report downloaded');
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const segment = replay?.segments?.[currentIndex];
  const interview = replay?.interview || replay;

  return (
    <AppLayout showFooter={false}>
      <PageContainer title="Interview Replay" subtitle={formatDate(interview?.created_at)}>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary">{capitalize(interview?.interview_type)}</Badge>
                <Badge>{capitalize(interview?.difficulty)}</Badge>
                <span className="text-gray-400">{interview?.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{Math.round(interview?.final_score || 0)}</span>
                <span className="text-gray-400">/ 100</span>
              </div>
            </div>
            <ProgressBar value={interview?.final_score || 0} label="Overall Score" />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="min-h-[300px]">
                {segment ? (
                  <div>
                    <Badge variant="accent" className="mb-3">Q{currentIndex + 1}</Badge>
                    <p className="text-lg font-medium mb-4">{segment.question}</p>
                    <div className="p-4 rounded-xl bg-white/5 mb-4">
                      <p className="text-sm text-gray-400 mb-1">Your Answer</p>
                      <p>{segment.answer}</p>
                    </div>
                    {segment.feedback && (
                      <div className="p-4 rounded-xl border border-accent/20 bg-accent/5">
                        <p className="text-sm text-accent mb-1">AI Feedback</p>
                        <p className="text-sm">{segment.feedback}</p>
                        {segment.score != null && (
                          <p className="text-xs text-gray-500 mt-2">Score: {segment.score}/10</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No replay data available.</p>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold mb-4">Playback Controls</h3>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaying(!playing)}
                    className="p-3 rounded-full bg-primary hover:bg-primary/90 transition-colors"
                  >
                    {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => Math.min((replay?.segments?.length || 1) - 1, i + 1))}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-center text-sm text-gray-400">
                  {currentIndex + 1} / {replay?.segments?.length || 0}
                </p>
                {interview?.duration_seconds && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Duration: {formatDuration(interview.duration_seconds)}
                  </p>
                )}
              </Card>
              <Button variant="secondary" icon={Download} className="w-full" onClick={handleDownload}>
                Download PDF Report
              </Button>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </AppLayout>
  );
}

export default InterviewReplay;
