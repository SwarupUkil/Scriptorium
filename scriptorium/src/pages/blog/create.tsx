import React from "react";
import BlogForm from "@/components/PostComponents/BlogForm";

const CreateBlogPage: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            <div className="container mx-auto p-6">
                <BlogForm />
            </div>
        </div>
    );
};

export default CreateBlogPage;