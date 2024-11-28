import React, { useEffect, useState } from "react";
import { Comment } from "@/types/PostType";
import { getComment } from "@/services/PostService";
import InteractionBar from "@/components/PostComponents/InteractionBar";
import EditCommentModal from "@/components/PostComponents/EditCommentModal";

type CommentComponentProps = {
    postId: number;
    onReply: (id: number) => void;
    onViewReplies: (id: number) => void;
    depth: number;
    showReplies: boolean;
};

const CommentComponent: React.FC<CommentComponentProps> = ({
                                                               postId,
                                                               onReply,
                                                               onViewReplies,
                                                               depth,
                                                               showReplies,
                                                           }) => {
    const [fullComment, setFullComment] = useState<Comment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [isCommenter, setCommenter] = useState<boolean>(false);

    const shift = Math.min(depth * 20, 160); // Limit maximum shift for deep nesting

    useEffect(() => {
        const fetchComment = async () => {
            try {
                const fetchedComment = await getComment(postId);
                setFullComment(fetchedComment);
            } catch (error) {
                console.error("Failed to fetch comment:", error);
                setFullComment(null);
            } finally {
                setLoading(false);
            }
        };

        fetchComment();
    }, [postId]);

    useEffect(() => {
        const username = localStorage.getItem("username");

        if (username === fullComment?.username) {
            setCommenter(true);
            return;
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "username" && fullComment && event.newValue === fullComment.username) {
                setCommenter(true);
            } else {
                setCommenter(false);
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [fullComment]);

    if (loading) {
        return (
            <div
                style={{ marginLeft: `${shift}px` }}
                className="flex bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md mb-2"
            >
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!fullComment) {
        return (
            <div
                style={{ marginLeft: `${shift}px` }}
                className="flex bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md mb-2"
            >
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load comment.</p>
            </div>
        );
    }

    const openEditModal = () => setEditModalOpen(true);

    const onCloseComment = (content?: string) => {
        if (content) {
            setFullComment((prev) => (prev ? { ...prev, content } : null));
        }
        setEditModalOpen(false);
    };

    return (
        <div className="flex items-start mb-4" style={{ marginLeft: `${shift}px` }}>
            {/* InteractionBar */}
            <div className="sticky top-6 flex-shrink-0 mr-4">
                <InteractionBar parentId={fullComment.postId} initialRating={fullComment.rating} />
            </div>

            {/* Main Content and Edit Button Container */}
            <div className="flex flex-1 items-stretch">
                {/* Comment Content */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                    {/* Comment Metadata */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {fullComment.username || "Unknown"} on{" "}
                        {new Date(fullComment.createdAt || "").toLocaleDateString()}
                    </p>

                    {/* Comment Content */}
                    <p className="text-gray-800 dark:text-gray-200 mb-4">{fullComment.content}</p>

                    {/* Reply and View Replies Buttons */}
                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={() => onReply(fullComment.postId)}
                            className="px-4 py-1 bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-sm rounded"
                        >
                            Reply
                        </button>

                        <button
                            onClick={() => onViewReplies(fullComment.postId)}
                            className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                            aria-label={`${showReplies ? "Hide" : "View"} replies for comment ${fullComment.postId}`}
                        >
                            {showReplies ? "Hide Replies" : "View Replies"}
                        </button>
                    </div>
                </div>

                {/* Edit Button */}
                {isCommenter && (
                    <div className="flex items-center pl-4">
                        <button
                            onClick={openEditModal}
                            className="h-full px-3 py-2 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        >
                            ✏️ Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <EditCommentModal
                    postId={fullComment.postId}
                    onClose={onCloseComment}
                    isOpen={isEditModalOpen}
                />
            )}
        </div>
    );
};

export default CommentComponent;