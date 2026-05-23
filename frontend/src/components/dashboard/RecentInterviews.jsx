import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import InterviewCard from './InterviewCard';
import EmptyState from '../common/EmptyState';
import { Mic } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { ROUTES } from '../../utils/constants';

function RecentInterviews({ interviews = [], loading }) {
  const history = useHistory();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!interviews.length) {
    return (
      <EmptyState
        icon={Mic}
        title="No interviews yet"
        description="Start your first AI-powered interview practice session."
        actionLabel="Start Interview"
        onAction={() => history.push(ROUTES.INTERVIEW_SETUP)}
      />
    );
  }

  return (
    <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
      {interviews.slice(0, 5).map((interview) => (
        <motion.div key={interview.id} variants={staggerItem}>
          <InterviewCard interview={interview} />
        </motion.div>
      ))}
      {interviews.length > 5 && (
        <button
          type="button"
          onClick={() => history.push(ROUTES.ANALYTICS)}
          className="w-full flex items-center justify-center gap-1 py-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

RecentInterviews.propTypes = {
  interviews: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
};

export default RecentInterviews;
