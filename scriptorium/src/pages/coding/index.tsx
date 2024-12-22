"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { executeCode } from "@/services/ExecuteService";
import { createTemplate } from "@/services/TemplateService";
import { useAuth } from "@/contexts/AuthContext";
import { ExecuteRequest } from "@/types/ExecuteType";
import { Template } from "@/types/TemplateType";
import { tokenMiddleware } from "@/services/TokenMiddleware";
import toast from "react-hot-toast";

import CodeForm from "@/components/Code/CodeForm";
import CodeEditor from "@/components/Code/CodeEditor";
import CodeOutput from "@/components/Code/CodeOutput";
import CodeButtons from "@/components/Code/CodeButtons";

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
      setError(err.message || "An unexpected error occurred.");
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
          <CodeForm
              title={title}
              setTitle={setTitle}
              language={language}
              setLanguage={setLanguage}
              privacy={privacy}
              setPrivacy={setPrivacy}
              explanation={explanation}
              setExplanation={setExplanation}
              tags={tags}
              setTags={setTags}
              languageOptions={languageOptions}
              privacyOptions={privacyOptions}
          />

          {/* Code Editor Section */}
          <CodeEditor
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCode={setCode}
              stdin={stdin}
              setStdin={setStdin}
          />

          {/* Buttons */}
          <CodeButtons
              handleExecute={handleExecute}
              handleSave={handleSave}
              loading={loading}
          />

          {/* Output and Error */}
          <CodeOutput output={output} error={error} />
        </div>
      </div>
  );
};

export default CodePage;