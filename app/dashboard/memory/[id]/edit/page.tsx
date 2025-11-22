'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMemoryById, updateMemory } from '@/app/actions/memories';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Memory, Location } from '@/types/memory';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LocationPicker from '@/components/LocationPicker';
import ActivityTagSelector from '@/components/ActivityTagSelector';
import Loading from '@/components/Loading';
import { motion } from 'framer-motion';

export default function EditMemoryPage() {
    const { coupleId } = useAuth();
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [memory, setMemory] = useState<Memory | null>(null);
    const [date, setDate] = useState('');
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [notes, setNotes] = useState<string[]>([]);
    const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
    const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
    const [newMediaPreviews, setNewMediaPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
    const [location, setLocation] = useState<Location | undefined>();
    const [activityTags, setActivityTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadMemory() {
            if (!coupleId) {
                setLoading(false);
                return;
            }

            const mem = await getMemoryById(coupleId, id);
            if (mem) {
                setMemory(mem);
                setDate(mem.date);
                setTitle(mem.title);
                setCaption(mem.caption);
                setNotes(mem.notes.length > 0 ? mem.notes : ['']);
                setExistingMediaUrls(mem.imageUrls || []);
                setLocation(mem.location);
                setActivityTags(mem.activityTags || []);
            }
            setLoading(false);
        }
        loadMemory();
    }, [id, coupleId]);

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalMedia = existingMediaUrls.length + newMediaFiles.length + files.length;

        if (totalMedia > 10) {
            setError('Maximum 10 media files allowed per memory');
            return;
        }

        const previews = files.map(file => {
            return new Promise<{ url: string; type: 'image' | 'video' }>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        url: reader.result as string,
                        type: file.type.startsWith('video/') ? 'video' : 'image'
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previews).then(newPreviews => {
            setNewMediaFiles([...newMediaFiles, ...files]);
            setNewMediaPreviews([...newMediaPreviews, ...newPreviews]);
        });
    };

    const removeExistingMedia = (index: number) => {
        setExistingMediaUrls(existingMediaUrls.filter((_, i) => i !== index));
    };

    const removeNewMedia = (index: number) => {
        setNewMediaFiles(newMediaFiles.filter((_, i) => i !== index));
        setNewMediaPreviews(newMediaPreviews.filter((_, i) => i !== index));
    };

    const isVideo = (url: string) => {
        return url.includes('/video/upload/') || url.match(/\.(mp4|webm|ogg)$/i);
    };

    const addNote = () => {
        setNotes([...notes, '']);
    };

    const updateNote = (index: number, value: string) => {
        const newNotes = [...notes];
        newNotes[index] = value;
        setNotes(newNotes);
    };

    const removeNote = (index: number) => {
        setNotes(notes.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (existingMediaUrls.length === 0 && newMediaFiles.length === 0) {
            setError('At least one image or video is required');
            return;
        }

        if (!coupleId) {
            setError('You must be linked with a partner to edit memories');
            return;
        }

        setSaving(true);
        setError('');

        try {
            // Upload new media files
            const newImageUrlPromises = newMediaFiles.map(file => uploadToCloudinary(file, coupleId));
            const newImageUrls = await Promise.all(newImageUrlPromises);

            // Combine existing and new image URLs
            const allImageUrls = [...existingMediaUrls, ...newImageUrls.map(r => r.url)];

            // Filter out empty notes
            const filteredNotes = notes.filter(note => note.trim() !== '');

            // Update memory
            const result = await updateMemory(coupleId, id, {
                date,
                title,
                caption,
                notes: filteredNotes,
                imageUrls: allImageUrls,
                location,
                activityTags,
            });

            if (result.success) {
                router.push(`/dashboard/memory/${id}`);
            } else {
                setError(result.error || 'Failed to update memory');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
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

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold gradient-text mb-2">Edit Memory</h1>
                <p className="text-gray-600 mb-8">Update your special moment</p>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    {/* Date */}
                    <Input
                        type="date"
                        label="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />

                    {/* Title */}
                    <Input
                        type="text"
                        label="Title"
                        placeholder="Give this memory a title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Caption
                        </label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-300 focus:outline-none transition-colors resize-none"
                            rows={3}
                            placeholder="Describe this memory..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            required
                        />
                    </div>

                    {/* Media Management */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photos & Videos ({existingMediaUrls.length + newMediaFiles.length}/10)
                        </label>

                        {/* Existing Media */}
                        {existingMediaUrls.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">Current media</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {existingMediaUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            {isVideo(url) ? (
                                                <video
                                                    src={url}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <img
                                                    src={url}
                                                    alt={`Media ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeExistingMedia(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            {isVideo(url) && (
                                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                                    VIDEO
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Media Previews */}
                        {newMediaPreviews.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">New media to be added</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {newMediaPreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            {preview.type === 'video' ? (
                                                <video
                                                    src={preview.url}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <img
                                                    src={preview.url}
                                                    alt={`New media ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeNewMedia(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            {preview.type === 'video' && (
                                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                                    VIDEO
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add More Media */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-300 transition-colors"
                        >
                            <svg
                                className="w-10 h-10 mx-auto text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <p className="text-gray-600 text-sm">Add more images or videos</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleMediaChange}
                            className="hidden"
                        />
                    </div>



                    {/* Location Picker */}
                    <LocationPicker
                        value={location}
                        onChange={setLocation}
                    />

                    {/* Activity Tags */}
                    <ActivityTagSelector
                        selectedTags={activityTags}
                        onChange={setActivityTags}
                    />

                    {/* Notes */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Notes (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={addNote}
                                className="text-sm text-pink-500 hover:text-pink-600"
                            >
                                + Add Note
                            </button>
                        </div>
                        <div className="space-y-3">
                            {notes.map((note, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Note ${index + 1}`}
                                        value={note}
                                        onChange={(e) => updateNote(index, e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-pink-300 focus:outline-none transition-colors"
                                    />
                                    {notes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeNote(index)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push(`/dashboard/memory/${id}`)}
                            disabled={saving}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving} fullWidth>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div >
    );
}
