import React, { useEffect, useState } from "react";
import { parseCSVToTags } from "@/utils/frontend-helper/apiHelper";

interface ValidatedTagInputProps {
    value?: string;
    onChange: (tags: string[]) => void;
    label?: string;
    required?: boolean;
    error?: string;
    containerClassName?: string;
    tagClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    placeholder?: string;
    validate: (value: string) => boolean; // Validation function
    errorMessage: string; // Error message if validation fails
}

const ValidatedTagInput: React.FC<ValidatedTagInputProps> = ({
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
                                                                 validate,
                                                                 errorMessage,
                                                             }) => {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [inputError, setInputError] = useState("");

    useEffect(() => {
        if (value) {
            setTags(parseCSVToTags(value));
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const trimmedValue = inputValue.trim();
            if (trimmedValue && validate(trimmedValue) && !tags.includes(trimmedValue)) {
                setTags((prev) => [...prev, trimmedValue]);
                onChange([...tags, trimmedValue]);
                setInputValue("");
                setInputError("");
            } else if (!validate(trimmedValue)) {
                setInputError(errorMessage);
            }
        }
    };

    const handleRemoveTag = (tag: string) => {
        const updatedTags = tags.filter((t) => t !== tag);
        setTags(updatedTags);
        onChange(updatedTags);
    };

    return (
        <div className={`flex flex-col w-full ${containerClassName}`}>
            {label && (
                <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div
                className="mt-1 flex-1 relative flex items-center gap-2 rounded-md border px-3 py-2 shadow-md sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 border-gray-300 focus-within:ring-indigo-500 focus-within:border-indigo-500"
            >
                <div className="w-full flex flex-wrap gap-2">
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
            {inputError && <p className="mt-1 text-xs text-red-500">{inputError}</p>}
        </div>
    );
};

export default ValidatedTagInput;