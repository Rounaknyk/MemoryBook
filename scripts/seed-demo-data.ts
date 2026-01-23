import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { adminAuth, adminDb } from '../lib/firebase-admin';
import { Memory } from '../types/memory';

const users = [
    {
        email: 'virat@gmail.com',
        password: 'virat',
        displayName: 'Virat',
    },
    {
        email: 'anushka@gmail.com',
        password: 'anushka',
        displayName: 'Anushka',
    },
];

const goaLocations = [
    {
        placeName: 'Baga Beach',
        address: 'Baga Beach, Goa',
        lat: 15.5553,
        lng: 73.7517,
    },
    {
        placeName: 'Fort Aguada',
        address: 'Fort Aguada, Candolim, Goa',
        lat: 15.4920,
        lng: 73.7737,
    },
    {
        placeName: 'Chapora Fort',
        address: 'Chapora Fort, Vagator, Goa',
        lat: 15.6058,
        lng: 73.7373,
    },
    {
        placeName: 'Dudhsagar Falls',
        address: 'Dudhsagar Falls, Sonaulim, Goa',
        lat: 15.3144,
        lng: 74.3143,
    },
];

const dummyImages = [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1540206395-688085723adb?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1590050752117-238cb0fb9dbb?w=800&auto=format&fit=crop&q=60',
];

async function seed() {
    for (const user of users) {
        let uid;
        try {
            const userRecord = await adminAuth().getUserByEmail(user.email);
            uid = userRecord.uid;
            console.log(`User ${user.email} already exists with UID: ${uid}`);
        } catch (error) {
            console.log(`Creating user ${user.email}...`);
            const userRecord = await adminAuth().createUser({
                email: user.email,
                password: user.password,
                displayName: user.displayName,
            });
            uid = userRecord.uid;
            console.log(`Created user ${user.email} with UID: ${uid}`);
        }

        // Create memories for this user
        const memoriesRef = adminDb().collection('memories');

        // Check if user already has memories to avoid duplicates (optional, but good for re-running)
        const existingMemories = await memoriesRef.where('userId', '==', uid).get();
        if (!existingMemories.empty) {
            console.log(`User ${user.email} already has memories. Skipping memory creation.`);
            continue;
        }

        console.log(`Creating memories for ${user.email}...`);

        for (let i = 0; i < 5; i++) {
            const location = goaLocations[i % goaLocations.length];
            const memory: Omit<Memory, 'id'> = {
                userId: uid,
                date: new Date().toISOString().split('T')[0], // Today
                title: `Trip to ${location.placeName}`,
                caption: `Enjoying the vibes at ${location.placeName}!`,
                notes: ['Best day ever!', 'Must visit again.'],
                imageUrls: [dummyImages[i % dummyImages.length]],
                location: location,
                activityTags: ['Travel', 'Fun', 'Goa'],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await memoriesRef.add(memory);
        }
        console.log(`Added 5 memories for ${user.email}`);
    }
    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch(console.error);
