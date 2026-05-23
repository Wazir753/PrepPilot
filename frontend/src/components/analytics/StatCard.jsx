import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { fadeInUp } from '../../utils/animations';

function StatCard({ icon: Icon, label, value, suffix = '', trend, color = 'primary' }) {
  const colors = {
    primary: 'text-primary bg-primary/10',
    accent: 'text-accent bg-accent/10',
    warning: 'text-yellow-400 bg-yellow-400/10',
  };

  return (
    <motion.div className="glass-card p-5" variants={fadeInUp}>
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-accent' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-bold mt-4">
        <CountUp end={value || 0} duration={1.5} decimals={Number.isInteger(value) ? 0 : 1} />
        {suffix}
      </p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  suffix: PropTypes.string,
  trend: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'accent', 'warning']),
};

export default StatCard;
