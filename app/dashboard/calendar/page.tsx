'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useRouter } from 'next/navigation';
import { getAllMemories, getMemoriesByDate } from '@/app/actions/memories';
import { Memory } from '@/types/memory';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function CalendarPage() {
    const { coupleId } = useAuth();
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedDateMemories, setSelectedDateMemories] = useState<Memory[]>([]);
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

    // Get dates that have memories
    const memoryDates = memories.map((m) => parseISO(m.date));

    // Load memories when date is selected
    useEffect(() => {
        if (!selectedDate || !coupleId) return;

        async function loadDateMemories() {
            const dateStr = format(selectedDate as Date, 'yyyy-MM-dd');
            const dateMemories = await getMemoriesByDate(coupleId!, dateStr);
            setSelectedDateMemories(dateMemories);
        }

        loadDateMemories();
    }, [selectedDate, coupleId]);

    const handleDayClick = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
    };

    const modifiers = {
        hasMemory: memoryDates,
    };

    const modifiersStyles = {
        hasMemory: {
            backgroundColor: '#FFD6E8',
            color: 'white',
            fontWeight: 'bold',
        },
    };

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold gradient-text mb-2">Memory Calendar</h1>
                <p className="text-gray-600 mb-8">Click on a date to view or add a memory</p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full" />
                            </div>
                        ) : (
                            <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                onDayClick={handleDayClick}
                                modifiers={modifiers}
                                modifiersStyles={modifiersStyles}
                                showOutsideDays
                                className="mx-auto"
                            />
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-4 h-4 rounded bg-pastel-pink" />
                                <span>Days with memories</span>
                            </div>
                        </div>
                    </div>

                    {/* Selected Date Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        {selectedDate ? (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    {format(selectedDate, 'MMMM d, yyyy')}
                                </h2>

                                {selectedDateMemories.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedDateMemories.map((mem, idx) => (
                                            <motion.div
                                                key={mem.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="border-2 border-gray-100 rounded-lg p-4 hover:border-pink-200 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/dashboard/memory/${mem.id}`)}
                                            >
                                                {mem.imageUrls && mem.imageUrls.length > 0 && (
                                                    <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                                                        <img
                                                            src={mem.imageUrls[0]}
                                                            alt={mem.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {mem.imageUrls.length > 1 && (
                                                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                                +{mem.imageUrls.length - 1} more
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-gray-800 mb-1">
                                                    {mem.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">{mem.caption}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg
                                            className="w-16 h-16 mx-auto text-gray-300 mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                        <p className="text-gray-600 mb-4">No memory for this date</p>
                                        <button
                                            onClick={() => router.push(`/dashboard/memory/new?date=${format(selectedDate, 'yyyy-MM-dd')}`)}
                                            className="bg-gradient-to-r from-pink-300 to-purple-300 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-400 hover:to-purple-400 transition-all"
                                        >
                                            Add Memory
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                Select a date to view or add a memory
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
