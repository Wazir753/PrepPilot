import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

function HeatmapChart({ data = [] }) {
  const getIntensity = (value) => {
    if (value >= 80) return 'bg-accent';
    if (value >= 60) return 'bg-primary';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-orange-500';
    return 'bg-red-500/50';
  };

  if (!data.length) {
    return (
      <div className="glass-card p-6 text-center text-gray-500">
        No weakness data available yet.
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">Weakness Heatmap</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.map((item) => (
          <div
            key={item.topic || item.name}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium truncate">{item.topic || item.name}</span>
              <span className="text-xs text-gray-500">{item.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={clsx('h-full rounded-full', getIntensity(item.score))}
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

HeatmapChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      topic: PropTypes.string,
      name: PropTypes.string,
      score: PropTypes.number,
    })
  ),
};

export default HeatmapChart;
