import React from 'react';

// GPT/ GPT
interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({
   type = 'button',
   onClick,
   children,
   disabled = false,
   className = '',
   variant = 'primary',
}) => {
    const baseStyles = 'px-4 py-2 rounded-md focus:outline-none focus:ring-2';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;