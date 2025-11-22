'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMemoriesByDate, getRecentMemories } from '@/app/actions/memories';
import { Memory } from '@/types/memory';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Button from '@/components/Button';
import TimeMachineCard from '@/components/TimeMachineCard';

export default function DashboardPage() {
    const { user, coupleId } = useAuth();
    const [todayMemories, setTodayMemories] = useState<Memory[]>([]);
    const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!coupleId) {
                setLoading(false);
                return;
            }

            const today = format(new Date(), 'yyyy-MM-dd');
            const [todayMems, recent] = await Promise.all([
                getMemoriesByDate(coupleId, today),
                getRecentMemories(coupleId, 6),
            ]);

            setTodayMemories(todayMems);
            setRecentMemories(recent);
            setLoading(false);
        }

        loadData();
    }, [coupleId]);

    const firstName = user?.email?.split('@')[0] || 'Friend';

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    Welcome back, {firstName}! 💕
                </h1>
                <p className="text-gray-600 text-lg">
                    Your shared journey with memories that last forever
                </p>
            </motion.div>

            {/* Time Machine Card */}
            <TimeMachineCard />

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <QuickActionCard
                    href="/dashboard/memory/new"
                    icon="plus"
                    title="Add Memory"
                    description="Create a new memory"
                    color="from-pink-300 to-rose-300"
                />
                <QuickActionCard
                    href="/dashboard/calendar"
                    icon="calendar"
                    title="Calendar"
                    description="Browse by date"
                    color="from-purple-300 to-lavender-300"
                />
                <QuickActionCard
                    href="/dashboard/gallery"
                    icon="grid"
                    title="Gallery"
                    description="View all memories"
                    color="from-peach-300 to-orange-200"
                />
            </motion.div>

            {/* Today's Memory */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full" />
                </div>
            ) : (
                <>
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Today&apos;s Memories</h2>
                        {todayMemories.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {todayMemories.map((memory) => (
                                    <Link key={memory.id} href={`/dashboard/memory/${memory.id}`}>
                                        <motion.div
                                            whileHover={{ y: -4 }}
                                            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer card-hover"
                                        >
                                            <div className="relative h-48">
                                                <Image
                                                    src={memory.imageUrls[0]}
                                                    alt={memory.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                                {memory.imageUrls.length > 1 && (
                                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                        +{memory.imageUrls.length - 1} more
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-800 mb-1 truncate">{memory.title}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">{memory.caption}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 text-center border-2 border-dashed border-pink-200">
                                <p className="text-gray-600 mb-4">No memories for today yet</p>
                                <Link href="/dashboard/memory/new">
                                    <Button>Create Today&apos;s Memory</Button>
                                </Link>
                            </div>
                        )}
                    </motion.section>

                    {/* Recent Memories */}
                    {recentMemories.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Recent Memories</h2>
                                <Link href="/dashboard/gallery" className="text-pink-500 hover:text-pink-600 transition-colors">
                                    View All →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recentMemories.map((memory) => (
                                    <MemoryCard key={memory.id} memory={memory} />
                                ))}
                            </div>
                        </motion.section>
                    )}
                </>
            )}
        </div>
    );
}

function QuickActionCard({
    href,
    icon,
    title,
    description,
    color,
}: {
    href: string;
    icon: string;
    title: string;
    description: string;
    color: string;
}) {
    const icons = {
        plus: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        ),
        calendar: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        ),
        grid: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        ),
    };

    return (
        <Link href={href}>
            <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-md cursor-pointer`}
            >
                <div className="flex items-start gap-4">
                    <div className="bg-white/90 p-3 rounded-lg">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {icons[icon as keyof typeof icons]}
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                        <p className="text-gray-600 text-sm">{description}</p>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

function MemoryCard({ memory }: { memory: Memory }) {
    return (
        <Link href={`/dashboard/memory/${memory.id}`}>
            <motion.div
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
            >
                <div className="relative h-48">
                    <Image
                        src={memory.imageUrls[0]}
                        alt={memory.title}
                        fill
                        className="object-cover"
                    />
                    {memory.imageUrls.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            +{memory.imageUrls.length - 1} more
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{memory.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{memory.caption}</p>
                    <p className="text-xs text-gray-500">
                        {format(new Date(memory.date), 'MMMM d, yyyy')}
                    </p>
                </div>
            </motion.div>
        </Link>
    );
}
