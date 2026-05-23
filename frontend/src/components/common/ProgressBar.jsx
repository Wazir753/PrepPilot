import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { getScoreColor } from '../../utils/helpers';

function ProgressBar({ value, max = 100, label, showValue = true, colorize = true, className = '' }) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className={clsx('space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-gray-400">{label}</span>}
          {showValue && <span className="font-medium">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', colorize ? getScoreColor(value) : 'bg-primary')}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  label: PropTypes.string,
  showValue: PropTypes.bool,
  colorize: PropTypes.bool,
  className: PropTypes.string,
};

export default ProgressBar;
