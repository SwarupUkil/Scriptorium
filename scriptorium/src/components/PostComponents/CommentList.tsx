import React, { useState } from "react";
import { Comment } from "@/types/PostType";
import CommentComponent from "./CommentComponent";
import { getReplies } from "@/services/PostService";
import ReplyCommentModal from "@/components/PostComponents/ReplyCommentModal";

type CommentListProps = {
    comments: Comment[];
    onReply: (id: number) => void;
    depth?: number;
};

const CommentList: React.FC<CommentListProps> = ({ comments, onReply, depth = 0 }) => {
    const [loadedReplies, setLoadedReplies] = useState<Record<number, Comment[]>>({});
    const [loadingReplies, setLoadingReplies] = useState<Record<number, boolean>>({});
    const [visibleReplies, setVisibleReplies] = useState<Record<number, boolean>>({});
    const [pagination, setPagination] = useState<Record<number, { skip: number; take: number; total: number }>>({});
    const [replyModal, setReplyModal] = useState<{ isOpen: boolean; parentId: number | null }>({
        isOpen: false,
        parentId: null,
    });

    const handleToggleReplies = async (commentId: number) => {
        const isVisible = visibleReplies[commentId] || false;

        // Toggle visibility
        setVisibleReplies((prev) => ({ ...prev, [commentId]: !isVisible }));

        // Fetch replies if not already loaded and becoming visible
        if (!loadedReplies[commentId] && !isVisible) {
            setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
            try {
                const response = await getReplies({ id: commentId, skip: 0, take: 5 });
                const [replies, paginate] = response || [[], { skip: 0, prevSkip: 0, take: 5, total: 0 }];
                setLoadedReplies((prev) => ({ ...prev, [commentId]: replies }));
                setPagination((prev) => ({
                    ...prev,
                    [commentId]: { skip: paginate.skip, take: paginate.take, total: paginate.total },
                }));
            } catch (error) {
                console.error(`Failed to fetch replies for comment ${commentId}:`, error);
            } finally {
                setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
            }
        }
    };

    const loadMoreReplies = async (commentId: number) => {
        const currentPagination = pagination[commentId];
        if (!currentPagination) return;

        const { skip, take, total } = currentPagination;

        // Prevent loading more if already at the end
        if (skip >= total) {
            setVisibleReplies((prev) => ({ ...prev, [commentId]: false }));
            return;
        }

        setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

        try {
            const response = await getReplies({ id: commentId, skip: skip, take: take });
            const [newReplies, paginate] = response || [[], { skip: skip, prevSkip: skip, take: 5, total: 0 }];
            setLoadedReplies((prev) => ({
                ...prev,
                [commentId]: [...(prev[commentId] || []), ...newReplies],
            }));
            setPagination((prev) => ({
                ...prev,
                [commentId]: { skip: paginate.skip, take: paginate.take, total: paginate.total },
            }));
        } catch (error) {
            console.error(`Failed to fetch more replies for comment ${commentId}:`, error);
        } finally {
            setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const handleReply = (parentId: number) => {
        setReplyModal({ isOpen: true, parentId });
    };

    const handleReplySubmit = (newComment?: Comment) => {
        if (newComment && replyModal.parentId) {
            const parentId: number = replyModal.parentId;
            setLoadedReplies((prev) => ({
                ...prev,
                [parentId]: [...(prev[parentId] || []), newComment],
            }));
        }
        setReplyModal({ isOpen: false, parentId: null });
    };

    return (
        <div>
            {comments.map((comment) => (
                <React.Fragment key={comment.postId}>
                    {/* Render the comment */}
                    <div className="pl-4">
                        <CommentComponent
                            postId={comment.postId}
                            onReply={handleReply}
                            onViewReplies={handleToggleReplies}
                            depth={depth}
                            showReplies={visibleReplies[comment.postId] || false}
                        />
                    </div>

                    {/* Render nested replies if visible */}
                    {visibleReplies[comment.postId] && loadedReplies[comment.postId] && (
                        <CommentList
                            comments={loadedReplies[comment.postId]}
                            onReply={onReply}
                            depth={depth + 1}
                        />
                    )}

                    {/* Show More Replies */}
                    {   pagination[comment.postId] &&
                        pagination[comment.postId].skip < pagination[comment.postId].total && (
                            <div className={"flex justify-center"}>
                                <button
                                    onClick={() => loadMoreReplies(comment.postId)}
                                    className="mb-2 px-4 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
                                >
                                    Show More Replies
                                </button>
                            </div>
                        )}

                    {/* Loading state for replies */}
                    {visibleReplies[comment.postId] && loadingReplies[comment.postId] && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 pl-4">Loading replies...</p>
                    )}
                </React.Fragment>
            ))}

            {replyModal.isOpen && (
                <ReplyCommentModal
                    isOpen={replyModal.isOpen}
                    parentId={replyModal.parentId as number}
                    onClose={handleReplySubmit}
                />
            )}
        </div>
    );
};

export default CommentList;