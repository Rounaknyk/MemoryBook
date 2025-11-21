'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { Memory } from '@/types/memory';

const MEMORIES_COLLECTION = 'memories';

/**
 * Get all memories that have location data (for map view)
 */
export async function getMemoriesWithLocations(): Promise<Memory[]> {
    try {
        // Get all memories and filter client-side for those with locations
        const q = query(
            collection(db, MEMORIES_COLLECTION),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const allMemories = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                date: data.date,
                title: data.title,
                caption: data.caption,
                notes: data.notes || [],
                imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
                location: data.location,
                userId: data.userId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        // Filter for memories that have location data
        return allMemories.filter(memory => memory.location && memory.location.lat && memory.location.lng);
    } catch (error) {
        console.error('Error getting memories with locations:', error);
        return [];
    }
}
