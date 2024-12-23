import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createBlog, updateBlog, getBlog } from "@/services/PostService";
import { NewBlogPost } from "@/types/PostType";
import { parseTagsToCSV } from "@/utils/frontend-helper/apiHelper";
import { tokenMiddleware } from "@/services/TokenMiddleware";
import toast from "react-hot-toast";

import { MultiValue, SingleValue } from "react-select";

import TagInput from "@/components/TagInput";
// import ValidatedTagInput from "@/components/ValidatedTagInput";
import TemplateSelect from "@/components/Code/TemplateSelect";

interface TemplateOption {
    value: number;
    label: string;
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
        const target = e.target as HTMLElement;

        // Prevent submit if Enter is pressed in input/select fields
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.closest(".react-select")) {
            e.preventDefault();
        }
    }
};

const BlogForm: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEditMode = id !== undefined;

    const [formData, setFormData] = useState<NewBlogPost>({
        title: "",
        content: "",
        tags: "",
        templates: [],
    });

    // We'll store the selected templates in the shape React-Select expects:
    // { value, label }, where value is the template ID.
    const [selectedTemplates, setSelectedTemplates] = useState<TemplateOption[]>([]);

    useEffect(() => {
        const fetchBlog = async () => {
            if (isEditMode && id) {
                const blog = await getBlog(Number(id));
                if (blog) {
                    setFormData({
                        id: blog.postId,
                        title: blog.title,
                        content: blog.content,
                        tags: blog.tags,
                        templates: blog.templates || [], // array of IDs
                    });

                    // Prepopulate the React Select array:
                    // We only have IDs from the blog, so let's label them "ID – (unknown title)"
                    // or simply "Template #ID". You could also fetch each ID to get the real title.
                    const preSelected = (blog.templates || []).map((tid: number) => ({
                        value: tid,
                        label: `${tid}`,
                    }));
                    setSelectedTemplates(preSelected);
                }
            }
        };

        fetchBlog();
    }, [id, isEditMode]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTagChange = (tags: string[]) => {
        setFormData((prev) => ({ ...prev, tags: parseTagsToCSV(tags) }));
    };

    // When user picks new templates in React-Select,
    // we get an array if isMulti = true, or a single object if single-select.
    const handleTemplateChange = (
        selected:
            | MultiValue<TemplateOption>
            | SingleValue<TemplateOption>
    ) => {
        let newSelectionArray: TemplateOption[] = [];

        if (Array.isArray(selected)) {
            newSelectionArray = selected;
        } else if (selected) {
            // single
            newSelectionArray = [selected] as TemplateOption[];
        }

        // Update the local state for the React-Select
        setSelectedTemplates(newSelectionArray);

        // Then store just the IDs in formData.templates
        setFormData((prev) => ({
            ...prev,
            templates: newSelectionArray.map((option) => option.value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode) {
            const success = await tokenMiddleware(updateBlog, [formData]);
            if (success) {
                toast.success("Updated!");
            } else {
                toast.error("Failed to update blog. Title and content required!");
            }
        } else {
            const newBlog = await tokenMiddleware(createBlog, [formData]);
            if (newBlog) {
                toast.success("Created!");
                router.push(`/blog/edit/${newBlog.postId}`); // Redirect to edit mode.
            } else {
                toast.error("Failed to create blog. Title and content required!");
            }
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h1 className="mt-4 text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                {isEditMode ? "Edit Blog" : "Create Blog"}
            </h1>
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                {/* Title */}
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Blog Title"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700
                     text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* Content */}
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Blog Content"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700
                     text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={8}
                />

                {/* Tags */}
                <TagInput
                    value={formData.tags}
                    onChange={handleTagChange}
                    label="Tags"
                    placeholder="Add tags (Press Enter/Space)"
                    containerClassName="mt-4"
                />

                <TemplateSelect
                    label="Templates"
                    placeholder="Search templates..."
                    isMulti
                    value={selectedTemplates}
                    onChange={handleTemplateChange}
                    className="mt-4"
                />

                {/* Submit button */}
                <div className="flex items-start justify-between">
                    <div className="flex-grow" />
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md
                       hover:bg-indigo-700 focus:ring focus:ring-indigo-300 focus:outline-none ml-auto"
                    >
                        {isEditMode ? "Update Blog" : "Create Blog"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogForm;