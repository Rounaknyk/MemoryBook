'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return null;
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pastel-pink/20 via-pastel-lavender/20 to-pastel-peach/20">
            {/* Navigation Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-bold gradient-text">MemoryVault</span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <NavLink href="/dashboard">Dashboard</NavLink>
                            <NavLink href="/dashboard/calendar">Calendar</NavLink>
                            <NavLink href="/dashboard/map">Map</NavLink>
                            <NavLink href="/dashboard/gallery">Gallery</NavLink>
                            <NavLink href="/dashboard/memory/new">Add Memory</NavLink>
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:block text-sm text-gray-600">
                                {user.email?.split('@')[0]}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-gray-100">
                    <nav className="flex items-center justify-around py-2 px-4">
                        <MobileNavLink href="/dashboard" icon="home">Home</MobileNavLink>
                        <MobileNavLink href="/dashboard/calendar" icon="calendar">Calendar</MobileNavLink>
                        <MobileNavLink href="/dashboard/map" icon="map">Map</MobileNavLink>
                        <MobileNavLink href="/dashboard/gallery" icon="grid">Gallery</MobileNavLink>
                        <MobileNavLink href="/dashboard/memory/new" icon="plus">Add</MobileNavLink>
                    </nav>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-gray-700 hover:text-pink-500 transition-colors font-medium"
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
    const icons = {
        home: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        ),
        calendar: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        ),
        grid: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        ),
        plus: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        ),
        map: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        ),
    };

    return (
        <Link href={href} className="flex flex-col items-center gap-1 text-gray-600 hover:text-pink-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icons[icon as keyof typeof icons]}
            </svg>
            <span className="text-xs">{children}</span>
        </Link>
    );
}
