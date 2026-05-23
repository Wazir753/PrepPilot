import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Mic,
  BarChart3,
  Trophy,
  User,
  Settings,
  Shield,
} from 'lucide-react';
import clsx from 'clsx';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.INTERVIEW_SETUP, icon: Mic, label: 'New Interview' },
  { to: ROUTES.ANALYTICS, icon: BarChart3, label: 'Analytics' },
  { to: ROUTES.LEADERBOARD, icon: Trophy, label: 'Leaderboard' },
  { to: ROUTES.PROFILE, icon: User, label: 'Profile' },
];

function Sidebar({ collapsed = false }) {
  const { isAdmin } = useAuth();

  const items = isAdmin
    ? [...navItems, { to: ROUTES.ADMIN, icon: Shield, label: 'Admin' }]
    : navItems;

  return (
    <aside
      className={clsx(
        'fixed left-0 top-16 bottom-0 z-30 glass border-r border-white/5 transition-all duration-300 hidden lg:block',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            exact={item.to === ROUTES.DASHBOARD}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
            activeClassName="!text-white bg-primary/10 border border-primary/20 shadow-neon"
          >
            <item.icon className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <motion.div
          className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-accent text-sm font-medium mb-1">
            <Settings className="w-4 h-4" />
            Pro Tip
          </div>
          <p className="text-xs text-gray-400">
            Practice daily to improve your interview scores by up to 40%.
          </p>
        </motion.div>
      )}
    </aside>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
};

export default Sidebar;
