import React from 'react';
import PropTypes from 'prop-types';
import { Clock } from 'lucide-react';
import { formatDuration } from '../../utils/helpers';

function InterviewTimer({ seconds }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
      <Clock className="w-4 h-4 text-accent animate-pulse" />
      <span className="font-mono text-lg font-semibold text-accent">{formatDuration(seconds)}</span>
    </div>
  );
}

InterviewTimer.propTypes = {
  seconds: PropTypes.number.isRequired,
};

export default InterviewTimer;
