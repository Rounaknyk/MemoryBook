'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMemoryById, deleteMemory } from '@/app/actions/memories';
import { Memory } from '@/types/memory';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';

export default function MemoryDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [memory, setMemory] = useState<Memory | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    useEffect(() => {
        async function loadMemory() {
            const mem = await getMemoryById(id);
            setMemory(mem);
            setLoading(false);
        }
        loadMemory();
    }, [id]);

    // Keyboard navigation for media carousel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!memory || memory.imageUrls.length <= 1) return;

            if (e.key === 'ArrowLeft') {
                setCurrentMediaIndex((prev) =>
                    prev > 0 ? prev - 1 : memory.imageUrls.length - 1
                );
            } else if (e.key === 'ArrowRight') {
                setCurrentMediaIndex((prev) =>
                    prev < memory.imageUrls.length - 1 ? prev + 1 : 0
                );
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [memory]);

    const handleDelete = async () => {
        setDeleting(true);
        const result = await deleteMemory(id);

        if (result.success) {
            router.push('/dashboard/gallery');
        } else {
            alert(result.error || 'Failed to delete memory');
            setDeleting(false);
        }
    };

    const nextMedia = () => {
        if (!memory) return;
        setCurrentMediaIndex((prev) =>
            prev < memory.imageUrls.length - 1 ? prev + 1 : 0
        );
    };

    const prevMedia = () => {
        if (!memory) return;
        setCurrentMediaIndex((prev) =>
            prev > 0 ? prev - 1 : memory.imageUrls.length - 1
        );
    };

    const isVideo = (url: string) => {
        return url.includes('/video/upload/') || url.match(/\.(mp4|webm|ogg)$/i);
    };

    if (loading) {
        return <Loading />;
    }

    if (!memory) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-600 mb-4">Memory not found</p>
                <Button onClick={() => router.push('/dashboard/gallery')}>
                    Back to Gallery
                </Button>
            </div>
        );
    }

    const hasMultipleMedia = memory.imageUrls && memory.imageUrls.length > 1;

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{memory.title}</h1>
                        <p className="text-gray-600">
                            {format(new Date(memory.date), 'MMMM d, yyyy')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => router.push(`/dashboard/memory/${id}/edit`)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setDeleteModalOpen(true)}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Media Carousel */}
                {memory.imageUrls && memory.imageUrls.length > 0 ? (
                    <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-8 group">
                        {isVideo(memory.imageUrls[currentMediaIndex]) ? (
                            <video
                                key={memory.imageUrls[currentMediaIndex]}
                                src={memory.imageUrls[currentMediaIndex]}
                                controls
                                className="w-full h-full object-contain bg-black"
                            />
                        ) : (
                            <Image
                                src={memory.imageUrls[currentMediaIndex]}
                                alt={memory.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        )}

                        {/* Media counter */}
                        {hasMultipleMedia && (
                            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                                {currentMediaIndex + 1} / {memory.imageUrls.length}
                            </div>
                        )}

                        {/* Activity Tags */}
                        {memory.activityTags && memory.activityTags.length > 0 && (
                            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
                                {memory.activityTags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-700 bg-opacity-90 backdrop-blur-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Navigation arrows */}
                        {hasMultipleMedia && (
                            <>
                                <button
                                    onClick={prevMedia}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextMedia}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* Thumbnail navigation for multiple media */}
                        {hasMultipleMedia && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {memory.imageUrls.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentMediaIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${index === currentMediaIndex
                                            ? 'bg-white w-8'
                                            : 'bg-white bg-opacity-50'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-96 md:h-[500px] rounded-2xl bg-gray-200 flex items-center justify-center mb-8">
                        <p className="text-gray-400">No media available</p>
                    </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    {/* Caption */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Caption</h2>
                        <p className="text-gray-700 leading-relaxed">{memory.caption}</p>
                    </div>

                    {/* Notes */}
                    {memory.notes.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Notes</h2>
                            <ul className="space-y-2">
                                {memory.notes.map((note, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-3 bg-pink-50 rounded-lg p-3"
                                    >
                                        <svg
                                            className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-gray-700">{note}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="pt-6 border-t border-gray-100 text-sm text-gray-500">
                        <p>Created: {format(memory.createdAt, 'MMM d, yyyy h:mm a')}</p>
                        {memory.updatedAt.getTime() !== memory.createdAt.getTime() && (
                            <p>Last updated: {format(memory.updatedAt, 'MMM d, yyyy h:mm a')}</p>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-center">
                    <Button variant="ghost" onClick={() => router.push('/dashboard/gallery')}>
                        ← Back to Gallery
                    </Button>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Memory"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete this memory? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={deleting}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={deleting}
                            fullWidth
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
