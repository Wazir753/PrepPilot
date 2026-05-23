import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { cardHover } from '../../utils/animations';

function Card({ children, className = '', hoverable = false, onClick, padding = true }) {
  const Component = hoverable ? motion.div : 'div';
  const motionProps = hoverable
    ? { variants: cardHover, initial: 'rest', whileHover: 'hover', whileTap: 'tap' }
    : {};

  return (
    <Component
      className={clsx(
        'glass-card',
        padding && 'p-6',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
  padding: PropTypes.bool,
};

export default Card;
