import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Footer from './Footer';

function AppLayout({ children, showFooter = true, transparentNav = false }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar transparent={transparentNav} />
      <div className="flex-1">{children}</div>
      {showFooter && <Footer />}
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showFooter: PropTypes.bool,
  transparentNav: PropTypes.bool,
};

export default AppLayout;
