'use client';

import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useLoadScript, OverlayView } from '@react-google-maps/api';
import { getMemoriesWithLocations } from '@/app/actions/map-memories';
import { Memory } from '@/types/memory';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { clusterMemories } from '@/utils/map-clustering';
import { useAuth } from '@/contexts/AuthContext';

const libraries: ('places' | 'geocoding')[] = ['places', 'geocoding'];

const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 120px)',
};

const defaultCenter = {
    lat: 19.0760, // Mumbai
    lng: 72.8777,
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
    ],
};

interface Cluster {
    id: string;
    lat: number;
    lng: number;
    memories: Memory[];
}

export default function MapPage() {
    const { coupleId } = useAuth();
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [memories, setMemories] = useState<Memory[]>([]);
    const [clusters, setClusters] = useState<Cluster[]>([]);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
    const [center, setCenter] = useState(defaultCenter);
    const router = useRouter();

    useEffect(() => {
        async function loadMemories() {
            if (!coupleId) {
                setLoading(false);
                return;
            }

            const memoriesWithLocation = await getMemoriesWithLocations(coupleId);
            setMemories(memoriesWithLocation);

            // Initial clustering
            const newClusters = clusterMemories(memoriesWithLocation);
            setClusters(newClusters);

            // Center map on first memory if exists
            if (memoriesWithLocation.length > 0 && memoriesWithLocation[0].location) {
                setCenter({
                    lat: memoriesWithLocation[0].location.lat,
                    lng: memoriesWithLocation[0].location.lng,
                });
            }

            setLoading(false);
        }
        loadMemories();
    }, [coupleId]);

    const isVideo = (url: string) => {
        return url.includes('/video/upload/') || url.match(/\.(mp4|webm|ogg)$/i);
    };

    if (loadError) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                    <p className="text-red-600">Error loading Google Maps</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full" />
            </div>
        );
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-yellow-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Google Maps Not Configured</h2>
                    <p className="text-gray-600 mb-4">
                        Add your Google Maps API key to enable the Memory Map feature
                    </p>
                    <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
                        <p className="text-sm font-mono text-gray-700">
                            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        See GOOGLE_MAPS_SETUP.md for instructions
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold gradient-text mb-2">Memory Map</h1>
                <p className="text-gray-600">
                    {memories.length === 0
                        ? 'No memories with locations yet'
                        : `${memories.length} ${memories.length === 1 ? 'memory' : 'memories'} on the map`
                    }
                </p>
            </motion.div>

            {loading ? (
                <div className="flex justify-center items-center h-96 bg-white rounded-2xl shadow-lg">
                    <div className="text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading memories...</p>
                    </div>
                </div>
            ) : memories.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Memories with Locations</h3>
                    <p className="text-gray-600 mb-6">
                        Start adding locations to your memories to see them on the map!
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/memory/new')}
                        className="bg-gradient-to-r from-pink-300 to-purple-300 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-400 hover:to-purple-400 transition-all"
                    >
                        Create Memory with Location
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={12}
                            onLoad={(mapInstance) => setMap(mapInstance)}
                            options={mapOptions}
                        >
                            {clusters.map((cluster) => (
                                <OverlayView
                                    key={cluster.id}
                                    position={{ lat: cluster.lat, lng: cluster.lng }}
                                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedCluster(cluster)}
                                        className="relative cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 relative z-10 transform transition-transform duration-200 group-hover:-translate-y-1">
                                            {cluster.memories[0].imageUrls && cluster.memories[0].imageUrls.length > 0 ? (
                                                isVideo(cluster.memories[0].imageUrls[0]) ? (
                                                    <video
                                                        src={cluster.memories[0].imageUrls[0]}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={cluster.memories[0].imageUrls[0]}
                                                        alt={cluster.memories[0].title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-500">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cluster Count Badge */}
                                        {cluster.memories.length > 1 && (
                                            <div className="absolute -top-2 -right-2 z-20 bg-pink-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                                                {cluster.memories.length}
                                            </div>
                                        )}

                                        {/* Triangle/Arrow at bottom */}
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm z-0" />
                                    </motion.div>
                                </OverlayView>
                            ))}
                        </GoogleMap>
                    </div>

                    {/* Selected Cluster Sidebar */}
                    <AnimatePresence>
                        {selectedCluster && (
                            <motion.div
                                initial={{ x: 400, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 400, opacity: 0 }}
                                className="absolute top-0 right-0 w-96 h-full bg-white rounded-l-2xl shadow-2xl overflow-hidden z-50"
                            >
                                <div className="h-full flex flex-col">
                                    {/* Header */}
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">
                                                {selectedCluster.memories[0].location?.placeName || 'Location Memories'}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                {selectedCluster.memories.length} {selectedCluster.memories.length === 1 ? 'memory' : 'memories'} here
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedCluster(null)}
                                            className="bg-white rounded-full p-2 shadow-sm hover:bg-gray-100 text-gray-500"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Memories List */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {selectedCluster.memories.map((memory) => (
                                            <div key={memory.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                                {/* Image */}
                                                <div className="relative h-48 w-full">
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
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700">
                                                        {new Date(memory.date).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <h3 className="font-bold text-gray-800 mb-1">{memory.title}</h3>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{memory.caption}</p>

                                                    <button
                                                        onClick={() => router.push(`/dashboard/memory/${memory.id}`)}
                                                        className="w-full text-center text-sm font-medium text-pink-500 hover:text-pink-600 py-2 border border-pink-100 rounded-lg hover:bg-pink-50 transition-colors"
                                                    >
                                                        View Full Memory
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
