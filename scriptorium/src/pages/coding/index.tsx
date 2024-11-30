"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import Editor from "@monaco-editor/react";
import { executeCode } from "@/services/ExecuteService";
import { createTemplate } from "@/services/TemplateService";
import { useAuth } from "@/contexts/AuthContext";
import { ExecuteRequest } from "@/types/ExecuteType";
import { Template } from "@/types/TemplateType";
import TagInput from "@/components/TagInput";
import {tokenMiddleware} from "@/services/TokenMiddleware";
import toast from "react-hot-toast";

const languageOptions = [
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Swift', value: 'swift' },
  { label: 'Java', value: 'java' },
  { label: 'Rust', value: 'rust' },
  { label: 'Go', value: 'go' },
  { label: 'PHP', value: 'php' },
  { label: 'Ruby', value: 'ruby' },
];

const privacyOptions = [
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
];

const CodePage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>("# Write your code here");
  const [stdin, setStdin] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("Untitled Template");
  const [explanation, setExplanation] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

  const handleExecute = async () => {
    setLoading(true);
    setOutput("");
    setError("");

    const requestData: ExecuteRequest = { code, language, stdin };

    try {
      const response = await executeCode(requestData);
      setOutput(response.output || "No output.");

      if (response.error) {
        console.log(response);
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.log(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      toast.error("Must be logged in to save templates.");
      console.log("You must be logged in to save templates.");
      return;
    }

    const newTemplate: Template = {
      code,
      language,
      title,
      explanation,
      tags,
      privacy,
    };

    try {
      const response = await tokenMiddleware(createTemplate, [newTemplate]);
      if (response) {
        toast.success("Saved!");
        await router.push(`/coding/${response.id}`);
      } else {
        toast.error("Failed to save the template. Title required!");
        console.log("Failed to save the template.");
      }
    } catch (err) {
      toast.error("Failed to save the template.");
      console.error("Error saving template:", err);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded p-6">
          <h1 className="text-2xl font-bold mb-4 dark:text-gray-200">
            Scriptorium Code Executor
          </h1>

          {/* Form Section */}
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
                    onChange={(e) => setPrivacy(e.target.value as "PUBLIC" | "PRIVATE")}
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

          {/* Code Editor */}
          <div className="mb-4">
            <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Your Code
            </label>
            <Editor
                height="300px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                }}
                className="border border-gray-300 rounded-md dark:border-gray-600"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="stdin" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Standard Input (stdin)
            </label>
            <textarea
              id="stdin"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Provide input for your program..."
            ></textarea>
          </div>

          {/* Buttons */}
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
              <div className="mb-4">
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

export default CodePage;