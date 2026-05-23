import React from 'react';
import PropTypes from 'prop-types';
import { Terminal } from 'lucide-react';
import Spinner from '../common/Spinner';

function CodeOutput({ output, error, loading }) {
  return (
    <div className="glass rounded-xl p-4 h-48 flex flex-col">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <Terminal className="w-4 h-4 text-accent" />
        Output
        {loading && <Spinner size="sm" className="ml-2" />}
      </div>
      <pre className="flex-1 overflow-auto text-sm font-mono text-gray-300 whitespace-pre-wrap">
        {loading ? 'Running...' : error || output || 'Run your code to see output here.'}
      </pre>
    </div>
  );
}

CodeOutput.propTypes = {
  output: PropTypes.string,
  error: PropTypes.string,
  loading: PropTypes.bool,
};

export default CodeOutput;
