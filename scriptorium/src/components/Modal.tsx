import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        &times;
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
};

export default Modal;