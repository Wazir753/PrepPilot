import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate, getScoreLabel } from '../../utils/helpers';
import { capitalize } from '../../utils/helpers';

function InterviewCard({ interview }) {
  const history = useHistory();
  const scoreInfo = getScoreLabel(interview.final_score || 0);

  const handleClick = () => {
    if (interview.status === 'completed') {
      history.push(`/interview/replay/${interview.id}`);
    } else if (interview.interview_type === 'coding') {
      history.push(`/interview/coding/${interview.id}`);
    } else {
      history.push(`/interview/live/${interview.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold truncate">{interview.role}</span>
          <Badge variant="primary">{capitalize(interview.interview_type)}</Badge>
          <Badge>{capitalize(interview.difficulty)}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(interview.created_at)}
          </span>
          <Badge variant={interview.status === 'completed' ? 'accent' : 'warning'}>
            {capitalize(interview.status)}
          </Badge>
        </div>
      </div>
      {interview.final_score != null && (
        <div className="text-right ml-4">
          <p className={`text-2xl font-bold ${scoreInfo.color}`}>{Math.round(interview.final_score)}</p>
          <p className="text-xs text-gray-500">{scoreInfo.label}</p>
        </div>
      )}
      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors ml-3 flex-shrink-0" />
    </button>
  );
}

InterviewCard.propTypes = {
  interview: PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.string,
    interview_type: PropTypes.string,
    difficulty: PropTypes.string,
    status: PropTypes.string,
    final_score: PropTypes.number,
    created_at: PropTypes.string,
  }).isRequired,
};

export default InterviewCard;
