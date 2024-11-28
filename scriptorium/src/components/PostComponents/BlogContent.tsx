import React from "react";
import InteractionBar from "@/components/PostComponents/InteractionBar";
import { BlogContentProps } from "@/types/PostType";

const BlogContent: React.FC<BlogContentProps> = ({blog,}) => {
    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 text-base mb-4">
                    {blog.content}
                </p>

                <InteractionBar
                    parentId={blog.postId}
                    initialRating={blog.rating}
                />
            </div>
        </>
    );
};

export default BlogContent;