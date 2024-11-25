import React from "react";

interface CardProps {
    title: string;
    content: string;
    footer?: React.ReactNode;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, content, footer, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg cursor-pointer"
        >
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-gray-600">{content}</p>
            {footer && <div className="mt-4">{footer}</div>}
        </div>
    );
};

export default Card;