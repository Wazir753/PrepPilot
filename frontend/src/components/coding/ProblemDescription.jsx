import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import Badge from '../common/Badge';
import { fadeInUp } from '../../utils/animations';

function ProblemDescription({ problem }) {
  if (!problem) {
    return (
      <div className="glass-card p-6 text-gray-500">Loading problem...</div>
    );
  }

  return (
    <motion.div className="glass-card p-6 space-y-4" variants={fadeInUp} initial="hidden" animate="visible">
      <div className="flex items-center gap-2 flex-wrap">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display font-bold">{problem.title}</h2>
        {problem.difficulty && <Badge variant="primary">{problem.difficulty}</Badge>}
      </div>
      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
      {problem.examples && problem.examples.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400">Examples</h3>
          {problem.examples.map((ex, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 font-mono text-sm">
              <p><span className="text-accent">Input:</span> {ex.input}</p>
              <p className="mt-1"><span className="text-primary">Output:</span> {ex.output}</p>
            </div>
          ))}
        </div>
      )}
      {problem.constraints && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Constraints</h3>
          <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
            {problem.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

ProblemDescription.propTypes = {
  problem: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    difficulty: PropTypes.string,
    examples: PropTypes.arrayOf(
      PropTypes.shape({ input: PropTypes.string, output: PropTypes.string })
    ),
    constraints: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default ProblemDescription;
