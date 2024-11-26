import React, { useEffect, useState } from "react";
import { Comment } from "@/types/PostType";
import { getComment } from "@/services/PostService";
import InteractionBar from "@/components/PostComponents/InteractionBar";

type CommentComponentProps = {
    postId: number;
    onLike: (id: number) => void;
    onDislike: (id: number) => void;
    onReply: (id: number) => void;
    onViewReplies: (id: number) => void;
    depth: number;
    showReplies: boolean;
};

const CommentComponent: React.FC<CommentComponentProps> = ({
                                                               postId,
                                                               onLike, onDislike,
                                                               onReply,
                                                               onViewReplies,
                                                               depth,
                                                               showReplies,
                                                           }) => {
    const [fullComment, setFullComment] = useState<Comment | null>(null);
    const [loading, setLoading] = useState(true);

    const shift = Math.min(depth * 20, 100); // Limit maximum shift for deep nesting

    useEffect(() => {
        const fetchComment = async () => {
            try {
                const fetchedComment = await getComment(postId);
                setFullComment(fetchedComment);
            } catch (error) {
                console.error("Failed to fetch comment:", error);
                setFullComment(null); // Fallback to partial comment
            } finally {
                setLoading(false);
            }
        };

        fetchComment();
    }, [postId]);

    if (loading) {
        return (
            <div
                style={{ marginLeft: `${shift}px` }}
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md mb-2"
            >
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!fullComment) {
        return (
            <div
                style={{ marginLeft: `${shift}px` }}
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md mb-2"
            >
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load comment.</p>
            </div>
        );
    }

    return (
        <div
            style={{ marginLeft: `${shift}px` }}
            className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md mb-2"
        >
            {/* Comment Metadata */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {fullComment.username || "Unknown"} on{" "}
                {new Date(fullComment.createdAt || "").toLocaleDateString()}
            </p>

            {/* Comment Content */}
            <p className="text-gray-800 dark:text-gray-200">{fullComment.content}</p>

            {/* Buttons */}
            <div className="mt-2 flex space-x-2">
                <InteractionBar parentId={fullComment.postId} initialRating={fullComment.rating}/>

                {/*<button*/}
                {/*    onClick={() => onViewReplies(fullComment.postId)}*/}
                {/*    className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"*/}
                {/*    aria-label={`${showReplies ? "Hide" : "View"} replies for comment ${fullComment.postId}`}*/}
                {/*>*/}
                {/*    {showReplies ? "Hide Replies" : "View Replies"}*/}
                {/*</button>*/}
            </div>
        </div>
    );
};

export default CommentComponent;