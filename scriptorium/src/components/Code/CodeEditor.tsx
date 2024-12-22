import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
    language: string;
    setLanguage: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    stdin: string;
    setStdin: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    language,
    setLanguage,
    code,
    setCode,
    stdin,
    setStdin,
}) => {
    return (
        <>
            {/* Code Editor */}
            <div className="mb-4">
                <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Your Code
                </label>
                <Editor
                    height="300px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        automaticLayout: true,
                    }}
                    className="border border-gray-300 rounded-md dark:border-gray-600"
                />
            </div>

            {/* Standard Input */}
            <div className="mb-4">
                <label
                    htmlFor="stdin"
                    className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
                >
                    Standard Input (stdin)
                </label>
                <textarea
                    id="stdin"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-gray-100"
                    placeholder="Provide input for your program..."
                ></textarea>
            </div>
        </>
    );
};

export default CodeEditor;