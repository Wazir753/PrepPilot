import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

function Select({ label, error, options, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <div className="relative">
        <select
          className={clsx(
            'input-field appearance-none pr-10 cursor-pointer',
            error && 'ring-2 ring-red-500/50',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  className: PropTypes.string,
};

export default Select;
