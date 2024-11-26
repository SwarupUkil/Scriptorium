import React from "react";
import InteractionBar from "@/components/PostComponents/InteractionBar";
import { BlogContentProps } from "@/types/PostType";
import CommentForm from "@/components/PostComponents/CommentForm";

const BlogContent: React.FC<BlogContentProps> = ({
                                                     blog,
                                                     onLike,
                                                     onDislike,
                                                     onReply,
                                                 }) => {
    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 text-base mb-4">
                    {blog.content}
                </p>

                <InteractionBar
                    parentId={blog.postId}
                    initialRating={blog.rating}
                    // onLike={onLike}
                    // onDislike={onDislike}
                    // onReply={onReply}
                />
            </div>
        </>
    );
};

export default BlogContent;