import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        const { userId, email, displayName } = await request.json();

        if (!userId || !email) {
            return NextResponse.json(
                { error: 'Missing userId or email' },
                { status: 400 }
            );
        }

        // Create user profile document
        await setDoc(doc(db, 'users', userId), {
            email,
            displayName: displayName || null,
            coupleId: null,
            inviteCode: null,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating user profile:', error);
        return NextResponse.json(
            { error: 'Failed to create user profile' },
            { status: 500 }
        );
    }
}
