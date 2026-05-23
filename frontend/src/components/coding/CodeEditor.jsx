import React from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import useTheme from '../../hooks/useTheme';

function CodeEditor({ value, onChange, language = 'python', readOnly = false }) {
  const { isDark } = useTheme();

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 h-full min-h-[400px]">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme={isDark ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          padding: { top: 16 },
        }}
      />
    </div>
  );
}

CodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  language: PropTypes.string,
  readOnly: PropTypes.bool,
};

export default CodeEditor;
