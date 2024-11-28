import React from "react";
import { useRouter } from "next/router";
import BlogForm from "@/components/PostComponents/BlogForm";

const EditBlogPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Extract the blog ID from the route

    if (!id) {
        return (
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
                <div className="container mx-auto p-6">
                    <p className="text-red-500 dark:text-red-400">Invalid blog ID. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            <div className="container mx-auto p-6">
                <BlogForm />
            </div>
        </div>
    );
};

export default EditBlogPage;