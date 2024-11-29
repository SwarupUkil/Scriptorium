import React, { useEffect, useState } from "react";
import { parseCSVToTags } from "@/utils/frontend-helper/apiHelper";
import { ALLOWED_TAGS } from "@/utils/validateConstants";

interface TagInputProps {
    value?: string; // CSV-formatted string for initial tags
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
                                               value = "",
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
    const [isModalOpen, setModalOpen] = useState(false); // Modal state

    // Initialize tags from value prop
    useEffect(() => {
        if (value) {
            const initialTags = parseCSVToTags(value);
            setTags(initialTags);
        }
    }, [value]);

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
        <div className={`flex flex-col w-full ${containerClassName}`}>
            {/* Label */}
            {label && (
                <label
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Tag Input Container */}
            <div className="relative mt-1">
                <div
                    className="flex items-center gap-2 rounded-md border px-3 py-2  sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 border-gray-300 focus-within:ring-indigo-500 focus-within:border-indigo-500"
                >
                    <div className="flex flex-wrap items-center gap-2 flex-grow">
                        {tags.map((tag) => (
                            <div
                                key={tag}
                                className={`flex items-center px-3 py-1 bg-indigo-500 text-white text-sm rounded-full ${tagClassName}`}
                            >
                                <span>{tag}</span>
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
                            className={`flex-grow outline-none bg-transparent text-sm  text-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 ${inputClassName}`}
                        />
                    </div>
                    {/* Help Button */}
                    <button
                        onClick={() => setModalOpen(true)}
                        className="absolute right-1 px-2 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 focus:outline-none"
                    >
                        ?
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    role="dialog"
                    aria-labelledby="modal-title"
                    aria-modal="true"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                        <div className="flex justify-between items-center">
                            <h2
                                id="modal-title"
                                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                            >
                                Allowed Tags
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                aria-label="Close modal"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {ALLOWED_TAGS.map((tag) => (
                                <div
                                    key={tag}
                                    className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-full"
                                >
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagInput;