import React from 'react';

// GPT
interface InputProps {
    id: string;
    type?: 'text' | 'email' | 'password' | 'number';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    maxLength?: number;
    className?: string; // For additional styling
}

const Input: React.FC<InputProps> = ({
    id,
    type = 'text',
    value,
    onChange,
    onKeyDown,
    placeholder,
    label,
    error,
    disabled = false,
    required = false,
    maxLength = 100,
    className = '',
}) => {
    return (
        <div className={`flex flex-col w-full ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 focus:outline-0 sm:text-sm dark:bg-gray-800 dark:border-gray-600
                            dark:text-gray-200 ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default Input;