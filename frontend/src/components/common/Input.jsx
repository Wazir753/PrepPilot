import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

function Input({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={clsx('space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 light:text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        )}
        <input
          className={clsx(
            'input-field',
            Icon && 'pl-11',
            error && 'ring-2 ring-red-500/50 border-red-500/50',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

export default Input;
