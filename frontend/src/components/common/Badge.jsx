import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/10 text-gray-300',
    primary: 'bg-primary/20 text-primary border border-primary/30',
    accent: 'bg-accent/20 text-accent border border-accent/30',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'accent', 'success', 'warning', 'danger']),
  className: PropTypes.string,
};

export default Badge;
