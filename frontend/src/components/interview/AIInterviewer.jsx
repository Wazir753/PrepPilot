import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { pulseGlow } from '../../utils/animations';

function AIInterviewer({ isSpeaking = false, message }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4"
        variants={pulseGlow}
        animate={isSpeaking ? 'visible' : 'hidden'}
      >
        <Bot className="w-12 h-12 text-white" />
      </motion.div>
      <h3 className="font-display font-semibold text-lg mb-1">AI Interviewer</h3>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        {message || (isSpeaking ? 'Listening to your response...' : 'Ready for your answer')}
      </p>
      {isSpeaking && (
        <div className="flex gap-1 mt-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-accent"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

AIInterviewer.propTypes = {
  isSpeaking: PropTypes.bool,
  message: PropTypes.string,
};

export default AIInterviewer;
