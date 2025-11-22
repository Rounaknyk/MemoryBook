import { useEffect, useState } from 'react';
import { Memory } from '@/types/memory';
import { getTimeMachineMemories, TimeMachineData } from '@/app/actions/time-machine';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TimeMachineCard() {
    const { coupleId } = useAuth();
    const [data, setData] = useState<TimeMachineData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadMemories() {
            if (!coupleId) {
                setLoading(false);
                return;
            }

            const result = await getTimeMachineMemories(coupleId);
            setData(result);
            setLoading(false);
        }

        loadMemories();
    }, [coupleId]);

    if (loading || !data || (data.onThisDay.length === 0 && data.lastMonth.length === 0 && data.lastMonthWeek.length === 0)) return null;

    const isVideo = (url: string) => {
        return url.includes('/video/upload/') || url.match(/\.(mp4|webm|ogg)$/i);
    };

    const renderMemorySection = (title: string, memories: Memory[], icon: React.ReactNode) => {
        if (memories.length === 0) return null;
        return (
            <div className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <h3 className="text-sm font-bold text-indigo-100 uppercase tracking-wider">{title}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {memories.slice(0, 2).map((memory) => (
                        <motion.div
                            key={memory.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => router.push(`/dashboard/memory/${memory.id}`)}
                            className="bg-white bg-opacity-10 rounded-xl p-3 cursor-pointer hover:bg-opacity-20 transition-all"
                        >
                            <div className="flex gap-3">
                                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-black/20">
                                    {memory.imageUrls && memory.imageUrls.length > 0 ? (
                                        isVideo(memory.imageUrls[0]) ? (
                                            <video
                                                src={memory.imageUrls[0]}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Image
                                                src={memory.imageUrls[0]}
                                                alt={memory.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/50">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-200 mb-1">
                                        {new Date(memory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                    <h3 className="font-bold text-white text-sm line-clamp-1">{memory.title}</h3>
                                    <p className="text-xs text-indigo-100 line-clamp-1 mt-1">{memory.caption}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-1 shadow-xl overflow-hidden"
        >
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Time Machine</h2>
                        <p className="text-indigo-100 text-sm">Rediscover your past</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-lg font-medium leading-relaxed italic text-indigo-50">
                        "{data.message}"
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-indigo-200">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        Generated by Gemini AI
                    </div>
                </div>

                <div className="space-y-6 divide-y divide-indigo-400/30">
                    {renderMemorySection("On This Day", data.onThisDay, (
                        <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    ))}

                    {renderMemorySection("Last Month", data.lastMonth, (
                        <svg className="w-4 h-4 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ))}

                    {renderMemorySection("Around This Time Last Month", data.lastMonthWeek, (
                        <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
