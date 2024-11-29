import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createBlog, updateBlog, getBlog } from "@/services/PostService";
import { NewBlogPost } from "@/types/PostType";
import TagInput from "@/components/TagInput";
import {parseTagsToCSV} from "@/utils/frontend-helper/apiHelper";
import {tokenMiddleware} from "@/services/TokenMiddleware";
import ValidatedTagInput from "@/components/ValidatedTagInput";

const BlogForm: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Extract action ('create' or 'edit') and ID (for editing)
    const isEditMode = id !== undefined; // Determine the mode

    const [formData, setFormData] = useState<NewBlogPost>({
        title: "",
        content: "",
        tags: "",
        templates: [],
    });

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
                        templates: blog.templates,
                    });
                }
            }
        };

        fetchBlog();
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTagChange = (tags: string[]) => {
        setFormData((prev) => ({ ...prev, tags: parseTagsToCSV(tags) }));
    };

    const handleTemplateChange = (templates: string[]) => {
        // Ensure templates are stored as an array of integers
        setFormData((prev) => ({
            ...prev,
            templates: templates.map((template) => parseInt(template, 10)),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode) {
            const success = await tokenMiddleware(updateBlog, [formData]);
            if (success) {
                console.log("Blog updated successfully!");
            }
        } else {
            const newBlog = await tokenMiddleware(createBlog, [formData]);
            if (newBlog) {
                router.push(`/blog/edit/${newBlog.postId}`); // Redirect to edit mode
            }
        }
    };

    return (
        <>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h1 className="mt-4 text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    {isEditMode ? "Edit Blog" : "Create Blog"}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Blog Title"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Blog Content"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={8}
                    />
                    <TagInput
                        value={formData.tags}
                        onChange={handleTagChange}
                        label="Tags"
                        placeholder="Add tags (Press Enter/Space)"
                        containerClassName="mt-4"
                    />
                    <ValidatedTagInput
                        value={formData.templates?.map(String).join(",")}
                        onChange={handleTemplateChange}
                        label="Template IDs"
                        placeholder="Add template IDs (Press Enter/Space)"
                        containerClassName="mt-4"
                        validate={(value) => /^\d+$/.test(value)} // Positive integer validation
                        errorMessage="Template IDs must be positive integers."
                    />
                    <div className="flex items-start justify-between">
                        <div className="flex-grow"/>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring focus:ring-indigo-300 focus:outline-none ml-auto"
                        >
                            {isEditMode ? "Update Blog" : "Create Blog"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default BlogForm;