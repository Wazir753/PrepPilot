import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { fadeInUp } from '../../utils/animations';

function GlassPanel({ children, className = '', glow = false, animate = true }) {
  const Component = animate ? motion.div : 'div';
  const motionProps = animate
    ? { variants: fadeInUp, initial: 'hidden', animate: 'visible' }
    : {};

  return (
    <Component
      className={clsx(
        'glass rounded-2xl p-6',
        glow && 'neon-border shadow-neon',
        className
      )}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

GlassPanel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  glow: PropTypes.bool,
  animate: PropTypes.bool,
};

export default GlassPanel;
