'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createMemory } from '@/app/actions/memories';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Location } from '@/types/memory';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LocationPicker from '@/components/LocationPicker';
import ActivityTagSelector from '@/components/ActivityTagSelector';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { sendMemoryNotification } from '@/lib/email';

export default function NewMemoryPage() {
    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');

    const [date, setDate] = useState(dateParam || format(new Date(), 'yyyy-MM-dd'));
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [notes, setNotes] = useState<string[]>(['']);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [location, setLocation] = useState<Location | undefined>();
    const [activityTags, setActivityTags] = useState<string[]>([]);

    const { user, coupleId, partnerEmail } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Limit to 10 files
        if (files.length > 10) {
            setError('Maximum 10 media files allowed per memory');
            return;
        }

        setMediaFiles(files);

        // Create previews for all files
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

        Promise.all(previews).then(setMediaPreviews);
    };

    const removeMediaFile = (index: number) => {
        setMediaFiles(mediaFiles.filter((_, i) => i !== index));
        setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
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

        if (mediaFiles.length === 0) {
            setError('At least one image or video is required');
            return;
        }

        if (!coupleId) {
            setError('You must be linked with a partner to create memories');
            return;
        }

        setLoading(true);
        setError('');
        setUploadProgress(0);

        try {
            // Upload all media files to Cloudinary in parallel
            const uploadPromises = mediaFiles.map(async (file, index) => {
                const result = await uploadToCloudinary(file, coupleId);
                setUploadProgress(((index + 1) / mediaFiles.length) * 100);
                return result.url;
            });

            const imageUrls = await Promise.all(uploadPromises);

            // Filter out empty notes
            const filteredNotes = notes.filter(note => note.trim() !== '');

            // Create memory in Firestore
            const result = await createMemory(coupleId, {
                date,
                title,
                caption,
                notes: filteredNotes,
                imageUrls: imageUrls,
                location,
                activityTags,
                userId: user?.uid || '',
            });

            if (result.success && result.id) {
                // Send email notification to partner if they exist
                if (partnerEmail) {
                    try {
                        await sendMemoryNotification({
                            to_email: partnerEmail,
                            from_name: user?.displayName || user?.email || 'Your Partner',
                            link: `${window.location.origin}/dashboard/memory/${result.id}`,
                            message: `I just posted a new memory: "${title}"`,
                        });
                    } catch (emailError) {
                        console.error('Failed to send notification email:', emailError);
                        // Don't block the user flow if email fails
                    }
                }

                router.push(`/dashboard/memory/${result.id}`);
            } else {
                setError(result.error || 'Failed to create memory');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold gradient-text mb-2">Add New Memory</h1>
                <p className="text-gray-600 mb-8">Capture a special moment</p>

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

                    {/* Media Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photos & Videos {mediaPreviews.length > 0 && `(${mediaPreviews.length}/10)`}
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-pink-300 transition-colors"
                        >
                            {mediaPreviews.length > 0 ? (
                                <div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {mediaPreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                {preview.type === 'video' ? (
                                                    <video
                                                        src={preview.url}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <img
                                                        src={preview.url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeMediaFile(index);
                                                    }}
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
                                    <p className="text-sm text-gray-500">Click to add more or change files</p>
                                </div>
                            ) : (
                                <div>
                                    <svg
                                        className="w-12 h-12 mx-auto text-gray-400 mb-2"
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
                                    <p className="text-gray-600">Click to upload images or videos</p>
                                    <p className="text-sm text-gray-500 mt-1">Up to 10 files (JPG, PNG, MP4, WebM)</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleMediaChange}
                            className="hidden"
                        />
                        {loading && uploadProgress > 0 && (
                            <div className="mt-3">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Uploading...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
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
                            onClick={() => router.back()}
                            disabled={loading}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} fullWidth>
                            Create Memory
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
