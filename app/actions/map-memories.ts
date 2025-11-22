'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
} from 'firebase/firestore';
import { Memory } from '@/types/memory';

/**
 * Get all memories that have location data (for map view)
 */
export async function getMemoriesWithLocations(coupleId: string): Promise<Memory[]> {
    try {
        // Get all memories from couple collection
        const querySnapshot = await getDocs(
            collection(db, 'couples', coupleId, 'memories')
        );

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
                activityTags: data.activityTags || [],
                userId: data.userId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        // Filter for memories that have location data and sort by date
        return allMemories
            .filter(memory => memory.location && memory.location.lat && memory.location.lng)
            .sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
        console.error('Error getting memories with locations:', error);
        return [];
    }
}
