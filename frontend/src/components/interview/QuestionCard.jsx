import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { fadeInUp } from '../../utils/animations';
import Badge from '../common/Badge';

function QuestionCard({ question, index }) {
  if (!question) return null;

  return (
    <motion.div
      key={question.id || index}
      className="glass-card p-6 neon-border"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <Badge variant="primary">Question {index + 1}</Badge>
        {question.category && <Badge>{question.category}</Badge>}
      </div>
      <p className="text-lg leading-relaxed">{question.text || question.question}</p>
      {question.hint && (
        <p className="mt-3 text-sm text-gray-500 italic">Hint: {question.hint}</p>
      )}
    </motion.div>
  );
}

QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string,
    question: PropTypes.string,
    category: PropTypes.string,
    hint: PropTypes.string,
  }),
  index: PropTypes.number.isRequired,
};

export default QuestionCard;
