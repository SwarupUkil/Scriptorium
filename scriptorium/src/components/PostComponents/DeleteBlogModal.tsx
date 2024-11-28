import React from "react";
import Modal from "../Modal";

type DeleteBlogModalProps = {
    blogId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
};

const DeleteBlogModal: React.FC<DeleteBlogModalProps> = ({
                                                             blogId,
                                                             isOpen,
                                                             onClose,
                                                             onDelete,
                                                         }) => {
    if (!blogId) return null; // Ensure a valid blog ID is provided

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Blog">
            <p>Are you sure you want to delete this blog?</p>
            <div className="mt-4 flex justify-end space-x-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Delete
                </button>
            </div>
        </Modal>
    );
};

export default DeleteBlogModal;