import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Menu, X, Sun, Moon, LogOut, User } from 'lucide-react';
import clsx from 'clsx';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { APP_NAME, ROUTES } from '../../utils/constants';

function Navbar({ transparent = false }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const history = useHistory();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    history.push(ROUTES.HOME);
  };

  const navLinks = isAuthenticated
    ? [
        { to: ROUTES.DASHBOARD, label: 'Dashboard' },
        { to: ROUTES.ANALYTICS, label: 'Analytics' },
        { to: ROUTES.LEADERBOARD, label: 'Leaderboard' },
      ]
    : [];

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        transparent ? 'bg-transparent' : 'glass border-b border-white/5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center group-hover:shadow-neon transition-shadow">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">{APP_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.PROFILE} className="flex items-center gap-2 hover:opacity-80">
                  <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
                  <span className="text-sm hidden lg:block">{user?.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => history.push(ROUTES.LOGIN)}>
                  Log in
                </Button>
                <Button onClick={() => history.push(ROUTES.REGISTER)}>Get Started</Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block py-2 text-gray-300"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to={ROUTES.PROFILE} className="flex items-center gap-2 py-2" onClick={() => setMobileOpen(false)}>
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button type="button" onClick={handleLogout} className="flex items-center gap-2 py-2 text-red-400">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="secondary" onClick={() => { history.push(ROUTES.LOGIN); setMobileOpen(false); }}>
                    Log in
                  </Button>
                  <Button onClick={() => { history.push(ROUTES.REGISTER); setMobileOpen(false); }}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

Navbar.propTypes = {
  transparent: PropTypes.bool,
};

export default Navbar;
