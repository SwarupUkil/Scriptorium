import React from "react";
import InteractionBar from "@/components/PostComponents/InteractionBar";
import { BlogContentProps } from "@/types/PostType";

const BlogContent: React.FC<BlogContentProps> = ({ blog }) => {
    return (
        <div className="relative flex items-start">
            {/* InteractionBar */}
            <div className="sticky top-6 flex-shrink-0 mr-4">
                <InteractionBar parentId={blog.postId} initialRating={blog.rating} />
            </div>

            {/* Blog Content */}
            <div className="flex-grow bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 text-base">
                    {blog.content}
                </p>
            </div>
        </div>
    );
};

export default BlogContent;