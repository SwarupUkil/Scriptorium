import React, { useState } from "react";
import { Comment } from "@/types/PostType";
import {getComment, createComment} from "@/services/PostService";

type CommentFormProps = {
    parentId: number;
    addComment: (newComment: Comment) => void;
};

const CommentForm: React.FC<CommentFormProps> = ({ parentId, addComment }) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return; // Prevent empty comments
        setLoading(true);

        try {
            const response = await createComment(parentId, content);

            if (!response) {
                // Modal to say failure.
                return;
            }

            const newComment = await getComment(response.postId);

            if (!newComment)  {
                // Modal to say failure.
                return;
            }
            addComment(newComment); // Pass the new comment to parent
            setContent(""); // Clear input
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-3 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <textarea
                className="resize-none p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Write your comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
            />
            <button
                onClick={handleSubmit}
                className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${
                    loading
                        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                }`}
                disabled={loading || !content.trim()}
            >
                {loading ? "Submitting..." : "Submit"}
            </button>
        </div>
    );
};

export default CommentForm;