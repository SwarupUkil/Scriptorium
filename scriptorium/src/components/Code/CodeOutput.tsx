import React from "react";

type CodeOutputProps = {
    stdin: string;
    setStdin: (value: string) => void;
    output: string;
    error: string;
    handleExecute: () => void;
    loading: boolean;
    handleSave: () => void;
    isOwner: boolean;
    handleFork?: () => void;
};

const CodeOutput: React.FC<CodeOutputProps> = ({
                                                   stdin,
                                                   setStdin,
                                                   output,
                                                   error,
                                                   handleExecute,
                                                   loading,
                                                   handleSave,
                                                   isOwner,
                                                   handleFork,
                                               }) => {
    return (
        <div>
            {/* StdIn */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Standard Input (stdin)
                </label>
                <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Provide input for your program..."
                ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={handleExecute}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                    {loading ? "Executing..." : "Execute"}
                </button>
                {isOwner ? (
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Save Template
                    </button>
                ) : (
                    <button
                        onClick={handleFork}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
                    >
                        Fork Template
                    </button>
                )}
            </div>

            {/* Output */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Output</h2>
                <div className="bg-gray-800 text-white p-4 rounded-md overflow-y-auto max-h-64">
                    <pre className="whitespace-pre-wrap">{output || "No output yet."}</pre>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                    <pre className="bg-red-800 text-white p-4 rounded-md overflow-auto">
            {error}
          </pre>
                </div>
            )}
        </div>
    );
};

export default CodeOutput;