import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Smile, Meh, Frown } from 'lucide-react';
import { EMOTION_LABELS } from '../../utils/constants';

const iconMap = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
  angry: Frown,
  fear: Frown,
};

function EmotionIndicator({ emotion, eyeContact }) {
  const config = EMOTION_LABELS[emotion] || EMOTION_LABELS.neutral;
  const Icon = iconMap[emotion] || Meh;

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Emotion</span>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon className={`w-6 h-6 ${config.color}`} />
        </motion.div>
      </div>
      <p className={`font-semibold ${config.color}`}>{config.label}</p>
      {eyeContact !== undefined && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Eye Contact</span>
            <span>{Math.round(eyeContact)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${eyeContact}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

EmotionIndicator.propTypes = {
  emotion: PropTypes.string,
  eyeContact: PropTypes.number,
};

export default EmotionIndicator;
