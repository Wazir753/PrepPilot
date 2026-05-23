import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../utils/animations';
import Button from './Button';

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
      )}
      <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-400 max-w-md mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
};

export default EmptyState;
