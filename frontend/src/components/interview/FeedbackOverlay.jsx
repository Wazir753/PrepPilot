import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { slideInFromBottom } from '../../utils/animations';

function FeedbackOverlay({ feedback, onDismiss }) {
  if (!feedback) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-4"
        variants={slideInFromBottom}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="glass-card p-4 neon-border shadow-neon-accent">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-accent mb-1">AI Feedback</h4>
              <p className="text-sm text-gray-300">
                {feedback.message || feedback.text || feedback}
              </p>
              {feedback.score !== undefined && (
                <p className="text-xs text-gray-500 mt-2">Score: {feedback.score}/10</p>
              )}
            </div>
            {onDismiss && (
              <button type="button" onClick={onDismiss} className="p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

FeedbackOverlay.propTypes = {
  feedback: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      text: PropTypes.string,
      score: PropTypes.number,
    }),
  ]),
  onDismiss: PropTypes.func,
};

export default FeedbackOverlay;
