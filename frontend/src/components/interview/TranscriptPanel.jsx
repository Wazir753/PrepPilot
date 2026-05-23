import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

function TranscriptPanel({ transcript, interimTranscript }) {
  const display = transcript || interimTranscript || '';

  return (
    <div className="glass rounded-xl p-4 h-48 flex flex-col">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <FileText className="w-4 h-4 text-primary" />
        Live Transcript
      </div>
      <div className="flex-1 overflow-y-auto">
        {display ? (
          <motion.p
            key={display.length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm leading-relaxed text-gray-300"
          >
            {display}
            {interimTranscript && !transcript && (
              <span className="text-gray-500 italic"> {interimTranscript}</span>
            )}
          </motion.p>
        ) : (
          <p className="text-sm text-gray-500 italic">Start speaking to see your transcript...</p>
        )}
      </div>
    </div>
  );
}

TranscriptPanel.propTypes = {
  transcript: PropTypes.string,
  interimTranscript: PropTypes.string,
};

export default TranscriptPanel;
