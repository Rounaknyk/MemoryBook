/**
 * DATA MIGRATION SCRIPT
 * 
 * This script migrates memories from the old structure (memories/{memoryId})
 * to the new couple-scoped structure (couples/{coupleId}/memories/{memoryId})
 * 
 * INSTRUCTIONS:
 * 1. Sign up and link with your partner to get your coupleId
 * 2. Replace YOUR_COUPLE_ID below with your actual coupleId
 * 3. Run this script ONCE: node scripts/migrate-data.js
 * 4. Verify all memories migrated successfully
 * 5. Delete old memories collection (optional)
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../service-account.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ⚠️ REPLACE THIS WITH YOUR ACTUAL COUPLE ID
const YOUR_COUPLE_ID = 'PASTE_YOUR_COUPLE_ID_HERE';

async function migrateMemories() {
    console.log('🚀 Starting memory migration...\n');

    if (YOUR_COUPLE_ID === 'PASTE_YOUR_COUPLE_ID_HERE') {
        console.error('❌ ERROR: Please replace YOUR_COUPLE_ID with your actual couple ID!');
        console.log('\nHow to get your couple ID:');
        console.log('1. Sign up and link with your partner');
        console.log('2. Open browser console on dashboard');
        console.log('3. Run: firebase.auth().currentUser.getIdTokenResult().then(r => console.log(r.claims.coupleId))');
        process.exit(1);
    }

    try {
        // Get all memories from old collection
        const oldMemoriesRef = db.collection('memories');
        const snapshot = await oldMemoriesRef.get();

        if (snapshot.empty) {
            console.log('✅ No memories found in old collection. Nothing to migrate.');
            return;
        }

        console.log(`📦 Found ${snapshot.size} memories to migrate\n`);

        let successCount = 0;
        let errorCount = 0;

        // Migrate each memory
        for (const doc of snapshot.docs) {
            try {
                const memoryData = doc.data();
                const memoryId = doc.id;

                // Create memory in new couple-scoped collection
                await db
                    .collection('couples')
                    .doc(YOUR_COUPLE_ID)
                    .collection('memories')
                    .doc(memoryId)
                    .set(memoryData);

                successCount++;
                console.log(`✅ Migrated: ${memoryData.title} (${memoryData.date})`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to migrate ${doc.id}:`, error.message);
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ❌ Failed: ${errorCount}`);
        console.log(`   📦 Total: ${snapshot.size}`);

        if (successCount === snapshot.size) {
            console.log('\n🎉 All memories migrated successfully!');
            console.log('\n⚠️  IMPORTANT NEXT STEPS:');
            console.log('1. Verify memories appear in your dashboard');
            console.log('2. Test creating/editing/deleting memories');
            console.log('3. Once confirmed, you can delete the old "memories" collection');
            console.log('4. Deploy Firestore rules: firebase deploy --only firestore:rules');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateMemories()
    .then(() => {
        console.log('\n✨ Migration script completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
