import React from "react";

type CardProps = {
    title: string; // Title of the card
    subtitle?: string; // Optional subtitle
    content: React.ReactNode; // The main content of the card
    actions?: React.ReactNode; // Actions like buttons at the bottom of the card
};

const Card: React.FC<CardProps> = ({ title, subtitle, content, actions }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                )}
                <div className="mt-4 text-gray-800 dark:text-gray-200">{content}</div>
            </div>
            {actions && (
                <div className="mt-6">
                    <div className="flex justify-end">{actions}</div>
                </div>
            )}
        </div>
    );
};

export default Card;