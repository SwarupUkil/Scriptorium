import React, { useState } from "react";

interface TagInputProps {
    onChange: (tags: string[]) => void;
    label?: string; // Label text for the input
    required?: boolean; // Whether the input is required
    error?: string; // Error message for validation
    containerClassName?: string; // Customize the container's styling
    tagClassName?: string; // Customize the tag bubble's styling
    inputClassName?: string; // Customize the input's styling
    labelClassName?: string; // Customize the label's styling
    placeholder?: string; // Placeholder for the input
}

const TagInput: React.FC<TagInputProps> = ({
    onChange,
    label,
    required = false,
    error,
    containerClassName = "",
    tagClassName = "",
    inputClassName = "",
    labelClassName = "",
    placeholder = "Type and press Enter/Space",
}) => {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const trimmedValue = inputValue.trim();
            if (trimmedValue && !tags.includes(trimmedValue)) {
                const newTags = [...tags, trimmedValue];
                setTags(newTags);
                onChange(newTags); // Notify parent about the new tags
                setInputValue("");
            }
        }
    };

    const handleRemoveTag = (tag: string) => {
        const newTags = tags.filter((t) => t !== tag);
        setTags(newTags);
        onChange(newTags); // Notify parent about the updated tags
    };

    return (
        <div className={`flex flex-col w-full ${containerClassName} overflow-x-auto overflow-y: auto; flex-nowrap whitespace-no-wrap`}>
            {/* Label */}
            {label && (
                <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300  ${labelClassName}`}
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Tag Input Container */}
            <div
                className={`mt-1 flex-1 relative flex items-center gap-2 rounded-md border px-3 py-2 shadow-md
                             sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 border-gray-300 
                             focus-within:ring-indigo-500 focus-within:border-indigo-500`}
            >
                {/* Tags */}
                <div className="w-full flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                    {tags.map((tag) => (
                        <div
                            key={tag}
                            className={`flex items-center px-3 py-0.25 bg-indigo-500 text-white text-sm rounded-full ${tagClassName}`}
                        >
                            <span className="truncate">{tag}</span>
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 text-white hover:text-gray-300 focus:outline-none"
                            >
                                &times;
                            </button>
                        </div>
                    ))}

                    {/* Input Field */}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`flex-grow outline-none bg-transparent text-sm shadow-sm text-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 ${inputClassName}`}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default TagInput;