import React, { useEffect, useState } from "react";
import { Comment } from "@/types/PostType";
import { getComment } from "@/services/PostService";
import InteractionBar from "@/components/PostComponents/InteractionBar";
import EditCommentModal from "@/components/PostComponents/EditCommentModal";

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
    const [loading, setLoading] = useState<boolean>(true);
    const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [isCommenter, setCommenter] = useState<boolean>(false);

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

    useEffect(() => {

        const username: string | null = localStorage.getItem("username"); // Retrieve auth token from local storage

        if (username === fullComment?.username) {
            setCommenter(true);
            return;
        }
        // Function to handle storage changes
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "username" && fullComment && event.newValue === fullComment.username) {
                setCommenter(true);
            } else {
                setCommenter(false);
            }
        };

        // Add the listener
        window.addEventListener("storage", handleStorageChange);

        return () => {
            // Clean up the listener
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [fullComment]); // Empty dependency array ensures this runs once on mount

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

    const openEditModal = () => {
        setEditModalOpen(true);
    };

    const onCloseComment = (content?: string) => {

        if (content) {
            const newComment = fullComment;
            newComment.content = content;
            setFullComment(newComment);
        }
        setEditModalOpen(false);
    }

    return (
        <div
            style={{marginLeft: `${shift}px`}}
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
                {
                    isCommenter && (
                        <button
                            onClick={openEditModal}
                            className="text-sm px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        >
                            ✏️ Edit
                        </button>
                    )
                }
            </div>
            {
                isEditModalOpen && (
                    <EditCommentModal postId={fullComment.postId} onClose={onCloseComment} isOpen={isEditModalOpen}/>)
            }
        </div>
    );
};

export default CommentComponent;