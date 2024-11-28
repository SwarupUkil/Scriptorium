import React, { useState } from "react";
import Modal from "../Modal";
import {createComment, getComment} from "@/services/PostService";
import {Comment} from "@/types/PostType"
import {tokenMiddleware} from "@/services/TokenMiddleware";

type ReplyCommentModalProps = {
    parentId: number;
    isOpen: boolean;
    onClose: (newComment?: Comment) => void;
};

const ReplyCommentModal: React.FC<ReplyCommentModalProps> = ({ parentId, isOpen, onClose }) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await tokenMiddleware(createComment, [parentId, content]);
            if (response) {
                const newComment = await getComment(response.postId);

                if (newComment){
                    onClose(newComment);
                } else {
                    onClose();
                }
            } else {
                console.error("Failed to create reply");
            }
        } catch (error) {
            console.error("Error submitting reply:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Comment">
            <textarea
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your reply..."
            />
            <div className="mt-4 flex justify-end space-x-2">
                <button
                    onClick={() => onClose()}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
                >
                    {loading ? "Replying..." : "Reply"}
                </button>
            </div>
        </Modal>
    );
};

export default ReplyCommentModal;