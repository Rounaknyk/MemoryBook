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

const MEMORIES_COLLECTION = 'memories';

export async function createMemory(data: {
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

        const docRef = await addDoc(collection(db, MEMORIES_COLLECTION), memoryData);

        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error creating memory:', error);
        return { success: false, error: error.message };
    }
}

export async function updateMemory(
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
        const memoryRef = doc(db, MEMORIES_COLLECTION, id);

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

export async function deleteMemory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteDoc(doc(db, MEMORIES_COLLECTION, id));
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting memory:', error);
        return { success: false, error: error.message };
    }
}

export async function getMemoryById(id: string): Promise<Memory | null> {
    try {
        const memoryDoc = await getDoc(doc(db, MEMORIES_COLLECTION, id));

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

export async function getMemoriesByDate(date: string): Promise<Memory[]> {
    try {
        const q = query(
            collection(db, MEMORIES_COLLECTION),
            where('date', '==', date)
        );

        const querySnapshot = await getDocs(q);

        const memories = querySnapshot.docs.map((memoryDoc) => {
            const data = memoryDoc.data();
            return {
                id: memoryDoc.id,
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

        // Sort by createdAt desc in memory to avoid composite index requirement
        return memories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error('Error getting memories by date:', error);
        return [];
    }
}

export async function getAllMemories(): Promise<Memory[]> {
    try {
        const q = query(
            collection(db, MEMORIES_COLLECTION),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                date: data.date,
                title: data.title,
                caption: data.caption,
                notes: data.notes || [],
                imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
                userId: data.userId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error getting all memories:', error);
        return [];
    }
}

export async function getRecentMemories(count: number = 6): Promise<Memory[]> {
    try {
        const q = query(
            collection(db, MEMORIES_COLLECTION),
            orderBy('date', 'desc'),
            limit(count)
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => {
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
    } catch (error) {
        console.error('Error getting recent memories:', error);
        return [];
    }
}

export async function getMemoriesByMonth(year: number, month: number): Promise<string[]> {
    try {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        const q = query(
            collection(db, MEMORIES_COLLECTION),
            where('date', '>=', startDate),
            where('date', '<=', endDate)
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => doc.data().date);
    } catch (error) {
        console.error('Error getting memories by month:', error);
        return [];
    }
}
