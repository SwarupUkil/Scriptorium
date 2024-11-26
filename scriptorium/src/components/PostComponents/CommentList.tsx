import React, { useState } from "react";
import { Comment } from "@/types/PostType";
import CommentComponent from "./CommentComponent";
import { getReplies } from "@/services/PostService";

type CommentListProps = {
    comments: Comment[];
    onLike: (id: number) => void;
    onDislike: (id: number) => void;
    onReply: (id: number) => void;
    depth?: number;
};

const CommentList: React.FC<CommentListProps> = ({ comments, onLike, onDislike, onReply, depth = 0 }) => {
    const [loadedReplies, setLoadedReplies] = useState<Record<number, Comment[]>>({});
    const [loadingReplies, setLoadingReplies] = useState<Record<number, boolean>>({});
    const [visibleReplies, setVisibleReplies] = useState<Record<number, boolean>>({});

    const handleToggleReplies = async (commentId: number) => {
        // Toggle visibility
        setVisibleReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));

        // Fetch replies if not already loaded and becoming visible
        if (!loadedReplies[commentId] && !loadingReplies[commentId]) {
            setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
            try {
                const response = await getReplies({ id: commentId });
                const [replies] = response || [[]];
                setLoadedReplies((prev) => ({ ...prev, [commentId]: replies }));
            } catch (error) {
                console.error(`Failed to fetch replies for comment ${commentId}:`, error);
            } finally {
                setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
            }
        }
    };

    return (
        <div>
            {comments.map((comment) => (
                <React.Fragment key={comment.postId}>
                    {/* Render the comment */}
                    <CommentComponent
                        postId={comment.postId}
                        onLike={onLike}
                        onDislike={onDislike}
                        onReply={onReply}
                        onViewReplies={handleToggleReplies}
                        depth={depth}
                        showReplies={visibleReplies[comment.postId] || false}
                    />

                    {/* Render nested replies if visible */}
                    {visibleReplies[comment.postId] && loadedReplies[comment.postId] && (
                        <CommentList
                            comments={loadedReplies[comment.postId]}
                            onLike={onLike}
                            onDislike={onDislike}
                            onReply={onReply}
                            depth={depth + 1}
                        />
                    )}

                    {/* Loading state for replies */}
                    {visibleReplies[comment.postId] && loadingReplies[comment.postId] && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 pl-4">Loading replies...</p>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default CommentList;