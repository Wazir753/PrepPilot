import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import CodeEditor from '../components/coding/CodeEditor';
import CodeOutput from '../components/coding/CodeOutput';
import LanguageSelector from '../components/coding/LanguageSelector';
import TestCases from '../components/coding/TestCases';
import ProblemDescription from '../components/coding/ProblemDescription';
import InterviewTimer from '../components/interview/InterviewTimer';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import useInterview from '../hooks/useInterview';
import codingService from '../services/codingService';
import { CODING_LANGUAGES, ROUTES } from '../utils/constants';

const DEFAULT_CODE = {
  python: 'def solution(nums):\n    # Your code here\n    pass\n',
  javascript: 'function solution(nums) {\n  // Your code here\n}\n',
  java: 'class Solution {\n    public int[] solution(int[] nums) {\n        // Your code here\n        return nums;\n    }\n}\n',
  cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums) {\n        // Your code here\n        return nums;\n    }\n};\n',
  go: 'package main\n\nfunc solution(nums []int) []int {\n    // Your code here\n    return nums\n}\n',
};

function CodingInterview() {
  const { id } = useParams();
  const history = useHistory();
  const { interview, elapsedSeconds, loadInterview, endInterview, loading: interviewLoading } = useInterview();
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [problem, setProblem] = useState(null);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (id && !initialized) {
      Promise.all([
        loadInterview(id),
        codingService.getProblem(id),
      ])
        .then(([, problemData]) => {
          setProblem(problemData);
          setInitialized(true);
        })
        .catch((err) => {
          toast.error(err.message);
          history.push(ROUTES.DASHBOARD);
        });
    }
  }, [id, initialized, loadInterview, history]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] || '');
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setError('');
    try {
      const result = await codingService.execute(id, { code, language });
      setOutput(result.output || result.stdout || '');
      if (result.error) setError(result.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleTest = async () => {
    setRunning(true);
    try {
      const result = await codingService.runTests(id, { code, language });
      setTestResults(result.tests || result.results || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    try {
      const result = await codingService.submit(id, { code, language });
      toast.success(`Submitted! Score: ${result.score || 'Pending'}`);
      await endInterview();
      history.push(ROUTES.ANALYTICS);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRunning(false);
    }
  };

  if (!initialized) {
    return (
      <AppLayout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const monacoLang = CODING_LANGUAGES.find((l) => l.value === language)?.monaco || language;

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen pt-16 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-display font-bold">Coding Interview — {interview?.role}</h1>
            <InterviewTimer seconds={elapsedSeconds} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ProblemDescription problem={problem} />
              <TestCases results={testResults} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <LanguageSelector value={language} onChange={handleLanguageChange} />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleRun} loading={running}>Run</Button>
                  <Button variant="secondary" onClick={handleTest} loading={running}>Test</Button>
                  <Button onClick={handleSubmit} loading={running || interviewLoading}>Submit</Button>
                </div>
              </div>
              <div className="h-96">
                <CodeEditor value={code} onChange={setCode} language={monacoLang} />
              </div>
              <CodeOutput output={output} error={error} loading={running} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default CodingInterview;
