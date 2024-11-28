import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void; // Ensure onClose has no parameters for consistency
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2
                        id="modal-title"
                        className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                    >
                        {title}
                    </h2>
                    {/*<button*/}
                    {/*    onClick={onClose}*/}
                    {/*    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"*/}
                    {/*    aria-label="Close modal"*/}
                    {/*>*/}
                    {/*    &times;*/}
                    {/*</button>*/}
                </div>

                {/* Content */}
                <div className="mt-4 text-gray-700 dark:text-gray-300">{children}</div>
            </div>
        </div>
    );
};

export default Modal;