'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    loading?: boolean;
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles =
        'px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    const variantStyles = {
        primary:
            'bg-gradient-to-r from-pink-300 to-purple-300 hover:from-pink-400 hover:to-purple-400 text-white shadow-md hover:shadow-lg',
        secondary:
            'bg-white border-2 border-pink-200 hover:border-pink-300 text-gray-700 hover:bg-pink-50',
        danger:
            'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg',
        ghost:
            'bg-transparent hover:bg-pink-50 text-gray-700',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
            disabled={disabled || loading}
            type={props.type}
            onClick={props.onClick}
            onSubmit={props.onSubmit}
        >
            {loading && (
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {children}
        </motion.button>
    );
}
