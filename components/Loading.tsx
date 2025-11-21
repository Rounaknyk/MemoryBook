'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="relative">
                    <motion.div
                        className="w-16 h-16 border-4 border-pink-200 rounded-full"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    <motion.div
                        className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </div>
                <p className="text-gray-600 font-medium">Loading...</p>
            </motion.div>
        </div>
    );
}
