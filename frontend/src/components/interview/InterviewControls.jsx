import React from 'react';
import PropTypes from 'prop-types';
import { Mic, MicOff, SkipForward, Square } from 'lucide-react';
import Button from '../common/Button';

function InterviewControls({
  isListening,
  onToggleMic,
  onSkip,
  onEnd,
  loading = false,
  micSupported = true,
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {micSupported && (
        <Button
          variant={isListening ? 'danger' : 'accent'}
          icon={isListening ? MicOff : Mic}
          onClick={onToggleMic}
          disabled={loading}
        >
          {isListening ? 'Stop Mic' : 'Start Mic'}
        </Button>
      )}
      <Button variant="secondary" icon={SkipForward} onClick={onSkip} loading={loading}>
        Skip Question
      </Button>
      <Button variant="danger" icon={Square} onClick={onEnd} disabled={loading}>
        End Interview
      </Button>
    </div>
  );
}

InterviewControls.propTypes = {
  isListening: PropTypes.bool,
  onToggleMic: PropTypes.func,
  onSkip: PropTypes.func,
  onEnd: PropTypes.func,
  loading: PropTypes.bool,
  micSupported: PropTypes.bool,
};

export default InterviewControls;
