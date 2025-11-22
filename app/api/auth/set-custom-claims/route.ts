import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const { userId, coupleId } = await request.json();

        if (!userId || !coupleId) {
            return NextResponse.json(
                { error: 'Missing userId or coupleId' },
                { status: 400 }
            );
        }

        // Set custom claim
        await adminAuth().setCustomUserClaims(userId, { coupleId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error setting custom claims:', error);
        return NextResponse.json(
            { error: 'Failed to set custom claims' },
            { status: 500 }
        );
    }
}
