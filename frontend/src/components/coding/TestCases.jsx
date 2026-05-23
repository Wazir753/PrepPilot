import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Badge from '../common/Badge';

function TestCases({ results = [] }) {
  if (!results.length) {
    return (
      <div className="glass rounded-xl p-4 text-sm text-gray-500 italic">
        No test results yet. Run tests to validate your solution.
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <h4 className="text-sm font-semibold text-gray-400 mb-3">Test Cases</h4>
      {results.map((test, i) => (
        <div
          key={test.id || i}
          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
        >
          <div className="flex items-center gap-2">
            {test.status === 'passed' && <CheckCircle className="w-4 h-4 text-accent" />}
            {test.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
            {test.status === 'running' && <Clock className="w-4 h-4 text-yellow-400 animate-spin" />}
            <span className="text-sm">Test {i + 1}</span>
          </div>
          <Badge variant={test.status === 'passed' ? 'accent' : test.status === 'failed' ? 'danger' : 'warning'}>
            {test.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

TestCases.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      status: PropTypes.oneOf(['passed', 'failed', 'running', 'pending']),
    })
  ),
};

export default TestCases;
