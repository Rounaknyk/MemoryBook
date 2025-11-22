'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from 'firebase/firestore';
import { Memory } from '@/types/memory';

export async function createMemory(coupleId: string, data: {
    date: string;
    title: string;
    caption: string;
    notes: string[];
    imageUrls: string[];
    location?: any;
    activityTags?: string[];
    userId: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const memoryData = {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // Store in couple-scoped collection
        const docRef = await addDoc(
            collection(db, 'couples', coupleId, 'memories'),
            memoryData
        );

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error creating memory:', error);
        return { success: false, error: error.message };
    }
}

export async function updateMemory(
    coupleId: string,
    id: string,
    data: Partial<{
        date: string;
        title: string;
        caption: string;
        notes: string[];
        imageUrls: string[];
        location: any;
        activityTags: string[];
    }>
): Promise<{ success: boolean; error?: string }> {
    try {
        const memoryRef = doc(db, 'couples', coupleId, 'memories', id);

        await updateDoc(memoryRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error updating memory:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteMemory(coupleId: string, id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteDoc(doc(db, 'couples', coupleId, 'memories', id));
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting memory:', error);
        return { success: false, error: error.message };
    }
}

export async function getMemoryById(coupleId: string, id: string): Promise<Memory | null> {
    try {
        const memoryDoc = await getDoc(doc(db, 'couples', coupleId, 'memories', id));

        if (!memoryDoc.exists()) {
            return null;
        }

        const data = memoryDoc.data();
        return {
            id: memoryDoc.id,
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
    } catch (error) {
        console.error('Error getting memory:', error);
        return null;
    }
}

export async function getMemoriesByDate(coupleId: string, date: string): Promise<Memory[]> {
    try {
        const querySnapshot = await getDocs(
            collection(db, 'couples', coupleId, 'memories')
        );

        const memories = querySnapshot.docs
            .map((memoryDoc) => {
                const data = memoryDoc.data();
                return {
                    id: memoryDoc.id,
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
            })
            .filter(memory => memory.date === date);

        // Sort by createdAt desc in memory
        return memories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error('Error getting memories by date:', error);
        return [];
    }
}

export async function getAllMemories(coupleId: string): Promise<Memory[]> {
    try {
        const querySnapshot = await getDocs(
            collection(db, 'couples', coupleId, 'memories')
        );

        const memories = querySnapshot.docs.map((doc) => {
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

        // Sort by date desc in memory
        return memories.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
        console.error('Error getting all memories:', error);
        return [];
    }
}

export async function getRecentMemories(coupleId: string, count: number = 6): Promise<Memory[]> {
    try {
        const querySnapshot = await getDocs(
            collection(db, 'couples', coupleId, 'memories')
        );

        const memories = querySnapshot.docs.map((doc) => {
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

        // Sort by date desc and limit
        return memories
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, count);
    } catch (error) {
        console.error('Error getting recent memories:', error);
        return [];
    }
}

export async function getMemoriesByMonth(coupleId: string, year: number, month: number): Promise<string[]> {
    try {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        const querySnapshot = await getDocs(
            collection(db, 'couples', coupleId, 'memories')
        );

        return querySnapshot.docs
            .map((doc) => doc.data().date)
            .filter(date => date >= startDate && date <= endDate);
    } catch (error) {
        console.error('Error getting memories by month:', error);
        return [];
    }
}
