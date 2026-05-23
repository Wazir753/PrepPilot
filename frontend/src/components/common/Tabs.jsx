import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

function Tabs({ tabs, defaultTab, onChange, className = '' }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (id) => {
    setActive(id);
    if (onChange) onChange(id);
  };

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div className="flex gap-1 p-1 glass rounded-xl mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleChange(tab.id)}
            className={clsx(
              'relative flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              active === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            )}
          >
            {active === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary/20 rounded-lg border border-primary/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      <div>{activeTab?.content}</div>
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      content: PropTypes.node,
    })
  ).isRequired,
  defaultTab: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default Tabs;
