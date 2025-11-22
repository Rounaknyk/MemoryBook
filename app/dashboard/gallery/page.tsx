'use client';

import { useState, useEffect } from 'react';
import { getAllMemories } from '@/app/actions/memories';
import { Memory } from '@/types/memory';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function GalleryPage() {
    const { coupleId } = useAuth();
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadMemories() {
            if (!coupleId) {
                setLoading(false);
                return;
            }

            const allMemories = await getAllMemories(coupleId);
            setMemories(allMemories);
            setLoading(false);
        }
        loadMemories();
    }, [coupleId]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full" />
            </div>
        );
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold gradient-text mb-2">Memory Gallery</h1>
                <p className="text-gray-600">
                    {memories.length} {memories.length === 1 ? 'memory' : 'memories'} captured
                </p>
            </motion.div>

            {memories.length === 0 ? (
                <div className="text-center py-16">
                    <svg
                        className="w-20 h-20 mx-auto text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="text-gray-600 mb-6">No memories yet. Start creating your story!</p>
                    <button
                        onClick={() => router.push('/dashboard/memory/new')}
                        className="bg-gradient-to-r from-pink-300 to-purple-300 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-400 hover:to-purple-400 transition-all"
                    >
                        Add Your First Memory
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memories.map((memory, index) => (
                        <motion.div
                            key={memory.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => router.push(`/dashboard/memory/${memory.id}`)}
                            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer card-hover"
                        >
                            <div className="relative h-64">
                                {memory.imageUrls && memory.imageUrls.length > 0 ? (
                                    <>
                                        <Image
                                            src={memory.imageUrls[0]}
                                            alt={memory.title}
                                            fill
                                            className="object-cover"
                                        />
                                        {/* Video indicator */}
                                        {(memory.imageUrls[0].includes('/video/upload/') || memory.imageUrls[0].match(/\.(mp4|webm|ogg)$/i)) && (
                                            <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                VIDEO
                                            </div>
                                        )}
                                        {/* Multiple media indicator */}
                                        {memory.imageUrls.length > 1 && (
                                            <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                +{memory.imageUrls.length - 1} more
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <p className="text-gray-400 text-sm">No image</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1 truncate">{memory.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{memory.caption}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(memory.date), 'MMM d, yyyy')}
                                    </p>
                                    {memory.notes.length > 0 && (
                                        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded">
                                            {memory.notes.length} {memory.notes.length === 1 ? 'note' : 'notes'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
