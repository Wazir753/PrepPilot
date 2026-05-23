import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { pageTransition } from '../../utils/animations';
import Sidebar from './Sidebar';

function PageContainer({ children, title, subtitle, withSidebar = true, className = '' }) {
  return (
    <div className="min-h-screen bg-background">
      <motion.main
        className={clsx(
          'page-container',
          withSidebar && 'lg:pl-64',
          className
        )}
        {...pageTransition}
      >
        {withSidebar && <Sidebar />}
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h1 className="text-3xl font-display font-bold gradient-text">{title}</h1>}
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </motion.main>
    </div>
  );
}

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  withSidebar: PropTypes.bool,
  className: PropTypes.string,
};

export default PageContainer;
