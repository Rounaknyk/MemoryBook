'use client';

import { motion } from 'framer-motion';

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
}

export default function Toggle({ enabled, onChange, label, description, disabled = false }: ToggleProps) {
    return (
        <div className="flex items-center justify-between">
            {(label || description) && (
                <div className="flex flex-col mr-4">
                    {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
                    {description && <span className="text-sm text-gray-500">{description}</span>}
                </div>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                disabled={disabled}
                onClick={() => !disabled && onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${enabled ? 'bg-pink-500' : 'bg-gray-200'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className="sr-only">{label || 'Toggle setting'}</span>
                <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                    animate={{ x: enabled ? '100%' : '0%' }}
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? '-translate-x-full' : 'translate-x-0'
                        }`}
                    style={{ x: enabled ? 20 : 0 }}
                />
            </button>
        </div>
    );
}
