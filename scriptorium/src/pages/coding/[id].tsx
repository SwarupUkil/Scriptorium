"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    getTemplate,
    updateTemplate,
    forkTemplate,
    getSpecificTemplateByUser,
} from "@/services/TemplateService";
import { executeCode } from "@/services/ExecuteService";
import { Template } from "@/types/TemplateType";
import { ExecuteRequest } from "@/types/ExecuteType";
import { parseCSVToTags } from "@/utils/frontend-helper/apiHelper";
import { tokenMiddleware } from "@/services/TokenMiddleware";
import toast from "react-hot-toast";

import CodeForm from "@/components/Code/CodeForm";
import CodeEditor from "@/components/Code/CodeEditor";
import CodeOutput from "@/components/Code/CodeOutput";
import CodeButtons from "@/components/Code/CodeButtons";
import Link from "next/link";

const languageOptions = [
    { label: "Python", value: "python" },
    { label: "JavaScript", value: "javascript" },
    { label: "C", value: "c" },
    { label: "C++", value: "cpp" },
    { label: "Swift", value: "swift" },
    { label: "Java", value: "java" },
    { label: "Rust", value: "rust" },
    { label: "Go", value: "go" },
    { label: "PHP", value: "php" },
    { label: "Ruby", value: "ruby" },
];

const privacyOptions = [
    { label: "Public", value: "PUBLIC" },
    { label: "Private", value: "PRIVATE" },
];

const EditOrForkTemplate: React.FC = () => {
    const router = useRouter();
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
                    const fetchedTemplateAgain = await tokenMiddleware(
                        getSpecificTemplateByUser,
                        [templateId]
                    );

                    if (fetchedTemplateAgain) {
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

    const handleSave = async () => {
        if (!template) return;

        try {
            const response = await tokenMiddleware(updateTemplate, [template]);
            if (response) {
                toast.success("Saved!");
                console.log("Template saved successfully.");
            } else {
                toast.error("Error saving template. Title required!");
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

    if (loading) return <div>Loading...</div>;
    if (!template) return <div>Template not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-gray-100">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded p-6">
                {/* Flex Container for Header and Forked Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h1 className="text-2xl font-bold dark:text-gray-200">
                        {isOwner ? "Edit Template" : "Fork Template"}
                    </h1>

                    {/* Forked From Indicator */}
                    {template.forkedFrom && (
                        <div className="mt-2 sm:mt-0 text-sm text-gray-600 dark:text-gray-400">
                            Forked from template{' '}
                            <Link
                                href={`/coding/${template.forkedFrom}`}
                                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-300 text-xs
                                        hover:bg-indigo-500 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white transition"
                            >
                                 {template.forkedFrom}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Form Section */}
                <CodeForm
                    title={template.title || ""}
                    setTitle={(value) =>
                        setTemplate((prev) =>
                            prev ? {...prev, title: value} : prev
                        )
                    }
                    language={template.language || "python"}
                    setLanguage={(value) =>
                        setTemplate((prev) =>
                            prev ? {...prev, language: value} : prev
                        )
                    }
                    privacy={template.privacy || "PRIVATE"}
                    setPrivacy={(value) =>
                        setTemplate((prev) =>
                            prev ? { ...prev, privacy: value } : prev
                        )
                    }
                    explanation={template.explanation || ""}
                    setExplanation={(value) =>
                        setTemplate((prev) =>
                            prev ? { ...prev, explanation: value } : prev
                        )
                    }
                    tags={template.tags as string[] || []}
                    setTags={(newTags) =>
                        setTemplate((prev) =>
                            prev ? { ...prev, tags: newTags } : prev
                        )
                    }
                    languageOptions={languageOptions}
                    privacyOptions={privacyOptions}
                />

                {/* Code Editor Section */}
                <CodeEditor
                    language={template.language || "python"}
                    setLanguage={(value) =>
                        setTemplate((prev) =>
                            prev ? { ...prev, language: value } : prev
                        )
                    }
                    code={template.code || ""}
                    setCode={(value) =>
                        setTemplate((prev) =>
                            prev ? { ...prev, code: value } : prev
                        )
                    }
                    stdin={stdin}
                    setStdin={setStdin}
                />

                {/* Buttons */}
                <CodeButtons
                    handleExecute={handleExecute}
                    handleSave={isOwner ? handleSave : handleFork} // Conditionally handle save or fork
                    loading={executing}
                />

                {/* Output and Error */}
                <CodeOutput output={output} error={error} />
            </div>
        </div>
    );
};

export default EditOrForkTemplate;