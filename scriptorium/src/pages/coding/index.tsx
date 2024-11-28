"use client";

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { executeCode } from '@/services/ExecuteService';
import { ExecuteRequest } from '@/types/ExecuteType';

const languageOptions = [
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
];

const CodePage: React.FC = () => {
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('# Write your code here');
  const [stdin, setStdin] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleExecute = async () => {
    setLoading(true);
    setOutput('');
    setError('');

    const requestData: ExecuteRequest = { code, language, stdin };

    try {
      const response = await executeCode(requestData);
      setOutput(response.output || 'No output.');

      if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-6 dark:bg-gray-700">
        <h1 className="text-2xl font-bold mb-4 dark:text-gray-300">Scriptorium Code Executor</h1>

        <div className="mb-4">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Select Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-gray-100"
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Your Code
          </label>
          <Editor
            height="400px"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
            }}
            className="border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="stdin" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Standard Input (stdin)
          </label>
          <textarea
            id="stdin"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={4}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-gray-100"
            placeholder="Provide input for your program here..."
          ></textarea>
        </div>

        <div className="mb-4">
          <button
            onClick={handleExecute}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Executing...' : 'Execute'}
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Output</h2>
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-auto">
            {output || 'No output yet.'}
          </pre>
        </div>

        {error && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <pre className="bg-red-800 text-white p-4 rounded-md overflow-auto">
              {error}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePage;
