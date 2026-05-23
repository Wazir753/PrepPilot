import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock, Award } from 'lucide-react';
import StatCard from '../analytics/StatCard';
import { staggerContainer, staggerItem } from '../../utils/animations';

function StatsGrid({ stats = {} }) {
  const items = [
    { icon: Target, label: 'Total Interviews', value: stats.total_interviews || 0, color: 'primary' },
    { icon: TrendingUp, label: 'Avg Score', value: stats.average_score || 0, suffix: '%', color: 'accent' },
    { icon: Clock, label: 'Practice Hours', value: stats.total_hours || 0, color: 'primary' },
    { icon: Award, label: 'Best Score', value: stats.best_score || 0, suffix: '%', color: 'accent', trend: stats.score_trend },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.div key={item.label} variants={staggerItem}>
          <StatCard {...item} />
        </motion.div>
      ))}
    </motion.div>
  );
}

StatsGrid.propTypes = {
  stats: PropTypes.shape({
    total_interviews: PropTypes.number,
    average_score: PropTypes.number,
    total_hours: PropTypes.number,
    best_score: PropTypes.number,
    score_trend: PropTypes.number,
  }),
};

export default StatsGrid;
