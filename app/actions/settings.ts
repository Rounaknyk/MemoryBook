'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function getCoupleSettings(coupleId: string) {
    try {
        const coupleRef = doc(db, 'couples', coupleId);
        const coupleSnap = await getDoc(coupleRef);

        if (coupleSnap.exists()) {
            const data = coupleSnap.data();
            // Default to true if the field is missing
            return {
                emailNotificationsEnabled: data.emailNotificationsEnabled ?? true
            };
        }
        return { emailNotificationsEnabled: true };
    } catch (error) {
        console.error('Error fetching couple settings:', error);
        return { emailNotificationsEnabled: true };
    }
}

export async function updateCoupleSettings(coupleId: string, enabled: boolean) {
    try {
        const coupleRef = doc(db, 'couples', coupleId);
        await setDoc(coupleRef, { emailNotificationsEnabled: enabled }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error updating couple settings:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}
