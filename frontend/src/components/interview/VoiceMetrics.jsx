import React from 'react';
import PropTypes from 'prop-types';
import { Mic, Gauge, AlertCircle } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

function VoiceMetrics({ speakingSpeed, fillerWords, confidence }) {
  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Mic className="w-4 h-4 text-primary" />
        Voice Metrics
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 rounded-lg bg-white/5">
          <Gauge className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold">{speakingSpeed || 0}</p>
          <p className="text-xs text-gray-500">WPM</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5">
          <AlertCircle className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">{fillerWords || 0}</p>
          <p className="text-xs text-gray-500">Filler Words</p>
        </div>
      </div>
      <ProgressBar value={confidence || 0} label="Confidence" />
    </div>
  );
}

VoiceMetrics.propTypes = {
  speakingSpeed: PropTypes.number,
  fillerWords: PropTypes.number,
  confidence: PropTypes.number,
};

export default VoiceMetrics;
