import React from "react";
import TagInput from "@/components/TagInput";

interface CodeFormProps {
    title: string;
    onTitleChange: (value: string) => void;
    language: string;
    onLanguageChange: (value: string) => void;
    explanation: string;
    onExplanationChange: (value: string) => void;
    tags: string[];
    onTagsChange: (value: string[]) => void;
    privacy: "PUBLIC" | "PRIVATE";
    onPrivacyChange: (value: "PUBLIC" | "PRIVATE") => void;
    languageOptions: { label: string; value: string }[];
    privacyOptions: { label: string; value: "PUBLIC" | "PRIVATE" }[];
    isOwner?: boolean;
}

const CodeForm: React.FC<CodeFormProps> = ({
                                               title,
                                               onTitleChange,
                                               language,
                                               onLanguageChange,
                                               explanation,
                                               onExplanationChange,
                                               tags,
                                               onTagsChange,
                                               privacy,
                                               onPrivacyChange,
                                               languageOptions,
                                               privacyOptions,
                                               isOwner = true,
                                           }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Template Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                        placeholder="Enter a title for your template"
                    />
                </div>

                {/* Language */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Language
                    </label>
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                    >
                        {languageOptions.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Privacy */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Privacy
                    </label>
                    <select
                        value={privacy}
                        onChange={(e) => onPrivacyChange(e.target.value as "PUBLIC" | "PRIVATE")}
                        className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                        disabled={!isOwner}
                    >
                        {privacyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Explanation & Tags */}
            <div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Explanation
                    </label>
                    <textarea
                        value={explanation}
                        onChange={(e) => onExplanationChange(e.target.value)}
                        rows={5}
                        className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                        placeholder="Describe what this template does..."
                    />
                </div>
                <TagInput value={tags.join(",")} onChange={onTagsChange} />
            </div>
        </div>
    );
};

export default CodeForm;