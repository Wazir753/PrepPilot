import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Code, BarChart3, Trophy } from 'lucide-react';
import Card from '../common/Card';
import { ROUTES } from '../../utils/constants';
import { staggerContainer, staggerItem } from '../../utils/animations';

const actions = [
  { icon: Mic, label: 'Live Interview', desc: 'Practice with AI', to: ROUTES.INTERVIEW_SETUP, color: 'from-primary to-purple-600' },
  { icon: Code, label: 'Coding Challenge', desc: 'Solve problems', to: ROUTES.INTERVIEW_SETUP, color: 'from-accent to-teal-600' },
  { icon: BarChart3, label: 'View Analytics', desc: 'Track progress', to: ROUTES.ANALYTICS, color: 'from-blue-500 to-cyan-500' },
  { icon: Trophy, label: 'Leaderboard', desc: 'See rankings', to: ROUTES.LEADERBOARD, color: 'from-yellow-500 to-orange-500' },
];

function QuickActions({ className = '' }) {
  const history = useHistory();

  return (
    <motion.div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action) => (
        <motion.div key={action.label} variants={staggerItem}>
          <Card
            hoverable
            onClick={() => history.push(action.to)}
            className="cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:shadow-neon transition-shadow`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">{action.label}</h3>
            <p className="text-sm text-gray-400">{action.desc}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

QuickActions.propTypes = {
  className: PropTypes.string,
};

export default QuickActions;
