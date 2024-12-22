import React from "react";

interface CodeOutputProps {
    output: string;
    error: string;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ output, error }) => {
    return (
        <>
            {/* Output */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Output</h2>
                <div className="bg-gray-800 text-white p-4 rounded-md overflow-y-auto max-h-64">
                    <pre className="whitespace-pre-wrap">{output || "No output yet."}</pre>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                    <pre className="bg-red-800 text-white p-4 rounded-md overflow-auto">
            {error}
          </pre>
                </div>
            )}
        </>
    );
};

export default CodeOutput;