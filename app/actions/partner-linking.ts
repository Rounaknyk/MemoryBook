'use server';

// Import client SDK for user profile operations
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { PartnerInfo } from '@/types/user';

/**
 * Generate a random 6-character invite code
 */
function generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Get or create invite code for a user (uses client SDK - user must be authenticated)
 */
export async function getOrCreateInviteCode(userId: string): Promise<string> {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data()?.inviteCode) {
            return userSnap.data().inviteCode;
        }

        // Generate new invite code
        let inviteCode = generateRandomCode();

        // Ensure uniqueness
        let isUnique = false;
        while (!isUnique) {
            const q = query(collection(db, 'users'), where('inviteCode', '==', inviteCode));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                isUnique = true;
            } else {
                inviteCode = generateRandomCode();
            }
        }

        // Save invite code to user document (create if doesn't exist)
        await setDoc(userRef, { inviteCode }, { merge: true });

        return inviteCode;
    } catch (error) {
        console.error('Error generating invite code:', error);
        throw new Error('Failed to generate invite code');
    }
}

/**
 * Accept an invite and create a couple (uses client SDK - user must be authenticated)
 */
export async function acceptInvite(
    inviteCode: string,
    acceptorUserId: string,
    acceptorEmail: string
): Promise<{ success: boolean; coupleId?: string; error?: string }> {
    try {
        // Find user with this invite code
        const q = query(collection(db, 'users'), where('inviteCode', '==', inviteCode.toUpperCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: 'Invalid invite code' };
        }

        const inviterDoc = snapshot.docs[0];
        const inviterId = inviterDoc.id;
        const inviterData = inviterDoc.data();

        // Check if inviter already has a couple
        if (inviterData.coupleId) {
            return { success: false, error: 'This user is already partnered' };
        }

        // Check if acceptor already has a couple
        const acceptorSnap = await getDoc(doc(db, 'users', acceptorUserId));
        if (acceptorSnap.exists() && acceptorSnap.data()?.coupleId) {
            return { success: false, error: 'You are already partnered' };
        }

        // Check if trying to partner with self
        if (inviterId === acceptorUserId) {
            return { success: false, error: 'You cannot partner with yourself' };
        }

        // Create couple document
        const coupleRef = doc(collection(db, 'couples'));
        const coupleId = coupleRef.id;

        await setDoc(coupleRef, {
            userIds: [inviterId, acceptorUserId],
            partner1Email: inviterData.email,
            partner2Email: acceptorEmail,
            createdAt: new Date(),
        });

        // Update both users with coupleId
        await setDoc(doc(db, 'users', inviterId), { coupleId }, { merge: true });
        await setDoc(doc(db, 'users', acceptorUserId), { coupleId }, { merge: true });

        return { success: true, coupleId };
    } catch (error) {
        console.error('Error accepting invite:', error);
        return { success: false, error: 'Failed to link partners' };
    }
}

/**
 * Get partner information for a given couple
 */
export async function getPartnerInfo(coupleId: string, currentUserId: string): Promise<PartnerInfo | null> {
    try {
        const { adminDb } = await import('@/lib/firebase-admin');
        const db = adminDb();
        const coupleSnap = await db.collection('couples').doc(coupleId).get();

        if (!coupleSnap.exists) {
            return null;
        }

        const coupleData = coupleSnap.data();
        const partnerUserId = coupleData?.userIds.find((id: string) => id !== currentUserId);

        if (!partnerUserId) {
            return null;
        }

        const partnerSnap = await db.collection('users').doc(partnerUserId).get();

        if (!partnerSnap.exists) {
            return null;
        }

        const partnerData = partnerSnap.data();
        return {
            email: partnerData?.email,
            displayName: partnerData?.displayName,
        };
    } catch (error) {
        console.error('Error getting partner info:', error);
        return null;
    }
}

/**
 * Check if a user has a partner
 */
export async function hasPartner(userId: string): Promise<boolean> {
    try {
        const { adminDb } = await import('@/lib/firebase-admin');
        const db = adminDb();
        const userSnap = await db.collection('users').doc(userId).get();

        if (!userSnap.exists) {
            return false;
        }

        return !!userSnap.data()?.coupleId;
    } catch (error) {
        console.error('Error checking partner status:', error);
        return false;
    }
}
