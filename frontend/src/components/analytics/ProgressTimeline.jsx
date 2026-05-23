import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { staggerContainer, staggerItem } from '../../utils/animations';

function ProgressTimeline({ events = [] }) {
  if (!events.length) {
    return <p className="text-gray-500 text-sm italic">No progress events yet.</p>;
  }

  return (
    <motion.div className="space-y-0" variants={staggerContainer} initial="hidden" animate="visible">
      {events.map((event, i) => (
        <motion.div key={event.id || i} className="flex gap-4" variants={staggerItem}>
          <div className="flex flex-col items-center">
            {event.completed ? (
              <CheckCircle className="w-5 h-5 text-accent" />
            ) : (
              <Circle className="w-5 h-5 text-gray-600" />
            )}
            {i < events.length - 1 && <div className="w-px flex-1 bg-white/10 my-1" />}
          </div>
          <div className="pb-6">
            <p className="font-medium text-sm">{event.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.date)}</p>
            {event.description && (
              <p className="text-sm text-gray-400 mt-1">{event.description}</p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

ProgressTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      date: PropTypes.string,
      description: PropTypes.string,
      completed: PropTypes.bool,
    })
  ),
};

export default ProgressTimeline;
