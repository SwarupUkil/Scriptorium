"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Editor from "@monaco-editor/react";
import { useAuth } from "@/contexts/AuthContext";
import TagInput from "@/components/TagInput";
import {
    getTemplate,
    updateTemplate,
    forkTemplate, getSpecificTemplateByUser,
} from "@/services/TemplateService";
import { executeCode } from "@/services/ExecuteService";
import { Template } from "@/types/TemplateType";
import { ExecuteRequest } from "@/types/ExecuteType";
import { parseCSVToTags } from "@/utils/frontend-helper/apiHelper";
import {tokenMiddleware} from "@/services/TokenMiddleware";
import toast from "react-hot-toast";

const languageOptions = [
    { label: "Python", value: "python" },
    { label: "JavaScript", value: "javascript" },
    { label: "C", value: "c" },
    { label: "C++", value: "cpp" },
    { label: "Java", value: "java" },
];

const privacyOptions = [
    { label: "Public", value: "PUBLIC" },
    { label: "Private", value: "PRIVATE" },
];

const EditOrForkTemplate: React.FC = () => {
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [template, setTemplate] = useState<Template | null>(null);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [stdin, setStdin] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [executing, setExecuting] = useState<boolean>(false);

    const templateId = parseInt(router.query.id as string);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const fetchedTemplate = await getTemplate(templateId);
                if (fetchedTemplate) {
                    setTemplate({
                        ...fetchedTemplate,
                        tags: parseCSVToTags(fetchedTemplate.tags as string || ""),
                    });

                    const username = localStorage.getItem("username");
                    setIsOwner(fetchedTemplate.username === username);
                } else {
                    const fetchedTemplateAgain = await tokenMiddleware(getSpecificTemplateByUser, [templateId]);

                    if (fetchedTemplateAgain){
                        setTemplate({
                            ...fetchedTemplateAgain,
                            tags: parseCSVToTags(fetchedTemplateAgain.tags || ""),
                        });

                        const username = localStorage.getItem("username");
                        setIsOwner(fetchedTemplateAgain.username === username);
                    } else {
                        toast.error("Template not found.");
                        console.error("Template not found.");
                        await router.push("/");
                    }
                }
            } catch (error) {
                toast.error("Template not found.");
                console.error("Error fetching template:", error);
                await router.push("/");
            } finally {
                setLoading(false);
            }
        };

        if (templateId) fetchTemplate();
    }, [templateId, router]);

    const handleSave = async () => {
        if (!template) return;

        try {
            const response = await tokenMiddleware(updateTemplate, [template]);
            if (response) {
                toast.success("Saved!");
                console.log("Template saved successfully.");
            } else {
                toast.error("Error saving template.");
                console.log("Failed to save the template.");
            }
        } catch (error) {
            toast.error("Error saving template.");
            console.error("Error saving template:", error);
        }
    };

    const handleFork = async () => {
        try {
            const response = await tokenMiddleware(forkTemplate, [{ id: templateId }]);
            if (response) {
                toast.success("Forked!");
                console.log("Template forked successfully.");
                await router.push(`/coding/${response.id}`);
            } else {
                toast.error("Error forking template.");
                console.log("Failed to fork the template.");
            }
        } catch (error) {
            toast.error("Error forking template.");
            console.error("Error forking template:", error);
        }
    };

    const handleExecute = async () => {
        if (!template) return;
        setExecuting(true);
        setOutput("");
        setError("");

        const requestData: ExecuteRequest = {
            code: template.code || "",
            language: template.language || "python",
            stdin,
        };

        try {
            const response = await executeCode(requestData);
            setOutput(response.output || "No output.");
            if (response.error) {
                setError(response.error);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setExecuting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!template) return <div>Template not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-gray-100">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded p-6">
                <h1 className="text-2xl font-bold mb-4 dark:text-gray-200">
                    {isOwner ? "Edit Template" : "Fork Template"}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {/* Title */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Template Title
                            </label>
                            <input
                                type="text"
                                value={template.title || ""}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev!,
                                        title: e.target.value,
                                    }))
                                }
                                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                            />
                        </div>

                        {/* Language */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Language
                            </label>
                            <select
                                value={template.language || ""}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev!,
                                        language: e.target.value,
                                    }))
                                }
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
                                value={template.privacy || "PRIVATE"}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev!,
                                        privacy: e.target.value as "PUBLIC" | "PRIVATE",
                                    }))
                                }
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
                                value={template.explanation || ""}
                                onChange={(e) =>
                                    setTemplate((prev) => ({
                                        ...prev!,
                                        explanation: e.target.value,
                                    }))
                                }
                                rows={5}
                                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                            ></textarea>
                        </div>
                        <TagInput
                            value={(template.tags as string[] || []).join(",")}
                            onChange={(newTags) =>
                                setTemplate((prev) => ({
                                    ...prev!,
                                    tags: newTags,
                                }))
                            }
                        />
                    </div>
                </div>

                {/* Code Editor */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Code
                    </label>
                    <Editor
                        height="300px"
                        language={template.language}
                        value={template.code || ""}
                        onChange={(value) =>
                            setTemplate((prev) => ({
                                ...prev!,
                                code: value || "",
                            }))
                        }
                        theme="vs-dark"
                        options={{ fontSize: 14 }}
                    />
                </div>

                {/* Execute and StdIn */}
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

                <div className="flex justify-between mt-4">
                    <button
                        onClick={handleExecute}
                        disabled={executing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        {executing ? "Executing..." : "Execute"}
                    </button>
                    {isOwner ? (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Save Template
                        </button>
                    ) : (
                        <button
                            onClick={handleFork}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Fork Template
                        </button>
                    )}
                </div>

                {/* Output */}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Output</h2>
                    <div className="bg-gray-800 text-white p-4 rounded-md overflow-y-auto max-h-64">
                        <pre className="whitespace-pre-wrap">
                            {output || "No output yet."}
                        </pre>
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
        </div>
    );
};

export default EditOrForkTemplate;