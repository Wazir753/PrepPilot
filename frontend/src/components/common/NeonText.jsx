import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

function NeonText({ children, as: Tag = 'span', variant = 'primary', className = '' }) {
  const variants = {
    primary: 'neon-text',
    accent: 'text-accent',
    gradient: 'gradient-text',
  };

  return <Tag className={clsx('font-display font-bold', variants[variant], className)}>{children}</Tag>;
}

NeonText.propTypes = {
  children: PropTypes.node.isRequired,
  as: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'accent', 'gradient']),
  className: PropTypes.string,
};

export default NeonText;
