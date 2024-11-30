import React from "react";
import Editor from "@monaco-editor/react";

type CodeEditorProps = {
    code: string;
    setCode: (value: string) => void;
    language: string;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, language }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code
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
    );
};

export default CodeEditor;