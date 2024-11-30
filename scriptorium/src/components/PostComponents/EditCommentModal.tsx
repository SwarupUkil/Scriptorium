import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { getComment, updateComment } from "@/services/PostService";
import {tokenMiddleware} from "@/services/TokenMiddleware";
import toast from "react-hot-toast";

type EditCommentModalProps = {
    postId: number;
    isOpen: boolean;
    onClose: (content?: string) => void;
};

const EditCommentModal: React.FC<EditCommentModalProps> = ({ postId, isOpen, onClose }) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch comment content when the modal opens
            const fetchComment = async () => {
                try {
                    const comment = await getComment(postId);
                    setContent(comment?.content || "");
                } catch (error) {
                    console.error("Failed to fetch comment:", error);
                    toast.error("Issue fetching comment");
                }
            };

            fetchComment();
        }
    }, [isOpen, postId]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const success = await tokenMiddleware(updateComment, [postId, content]);
            if (success) {
                // Trigger parent update or notification
                toast.success("Saved!");
                onClose(content);
            } else {
                toast.error("Issue updating comment");
                console.error("Failed to update comment");
            }
        } catch (error) {
            toast.error("Issue saving comment");
            console.error("Error saving comment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Comment">
            <textarea
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-2">
                <button
                    onClick={() => onClose()}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save"}
                </button>
            </div>
        </Modal>
    );
};

export default EditCommentModal;