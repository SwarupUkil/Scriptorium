import React from "react";
import TagInput from "@/components/TagInput";

interface CodeFormProps {
    title: string;
    setTitle: (value: string) => void;
    language: string;
    setLanguage: (value: string) => void;
    privacy: "PUBLIC" | "PRIVATE";
    setPrivacy: (value: "PUBLIC" | "PRIVATE") => void;
    explanation: string;
    setExplanation: (value: string) => void;
    tags: string[];
    setTags: (tags: string[]) => void;
    languageOptions: { label: string; value: string }[];
    privacyOptions: { label: string; value: string }[];
}

const CodeForm: React.FC<CodeFormProps> = ({
   title,
   setTitle,
   language,
   setLanguage,
   privacy,
   setPrivacy,
   explanation,
   setExplanation,
   tags,
   setTags,
   languageOptions,
   privacyOptions,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
                {/* Title */}
                <div className="mb-4">
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Template Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter a title for your template"
                    />
                </div>

                {/* Language */}
                <div className="mb-4">
                    <label
                        htmlFor="language"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Select Language
                    </label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
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
                    <label
                        htmlFor="privacy"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Privacy
                    </label>
                    <select
                        id="privacy"
                        value={privacy}
                        onChange={(e) =>
                            setPrivacy(e.target.value as "PUBLIC" | "PRIVATE")
                        }
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {privacyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Right Column */}
            <div>
                {/* Explanation */}
                <div className="mb-4">
                    <label
                        htmlFor="explanation"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Explanation
                    </label>
                    <textarea
                        id="explanation"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        rows={5}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe what this template does..."
                    ></textarea>
                </div>

                {/* Tags */}
                <div>
                    <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Tags
                    </label>
                    <TagInput
                        value={tags.join(",")}
                        onChange={(newTags) => setTags(newTags)}
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeForm;