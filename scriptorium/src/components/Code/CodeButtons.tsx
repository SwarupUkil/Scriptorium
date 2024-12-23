import React from "react";

interface CodeButtonsProps {
    handleExecute: () => void;
    handleSave: () => void;
    loading: boolean;
}

const CodeButtons: React.FC<CodeButtonsProps> = ({
    handleExecute,
    handleSave,
    loading,
}) => {
    return (
        <div className="flex justify-between mt-4">
            <button
                onClick={handleExecute}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
            >
                {loading ? "Executing..." : "Execute"}
            </button>

            <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
            >
                Save Template
            </button>
        </div>
    );
};

export default CodeButtons;