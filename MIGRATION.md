# Data Migration & Firebase Rules Setup

## 🔥 Firestore Security Rules

**File**: `firestore.rules` ✅ (Created)

Deploy the new rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📦 Data Migration Steps

### Step 1: Sign Up & Link Partner

1. **Sign up** your account at `/signup`
2. **Sign up** your partner's account
3. Go to `/dashboard/link-partner`
4. Copy your invite code and share with partner
5. Partner enters your code to link

### Step 2: Get Your Couple ID

Open browser console on the dashboard and run:
```javascript
firebase.auth().currentUser.getIdTokenResult().then(r => console.log(r.claims.coupleId))
```

Copy the `coupleId` that's printed.

### Step 3: Set Up Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `service-account.json` in project root
4. **⚠️ Add to .gitignore** (already there)

### Step 4: Run Migration Script

1. Open `scripts/migrate-data.js`
2. Replace `YOUR_COUPLE_ID` with your actual couple ID
3. Run migration:
   ```bash
   node scripts/migrate-data.js
   ```

### Step 5: Verify

1. Check your dashboard - all memories should appear
2. Test calendar, gallery, map
3. Try creating/editing a memory
4. If everything works, delete old `memories` collection in Firebase Console

---

## 🎯 Quick Commands

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Run migration (after setup)
node scripts/migrate-data.js
```

---

## ⚠️ Important Notes

- **Backup first**: Export your Firestore data before migration
- **Service account**: Keep `service-account.json` secret (it's in .gitignore)
- **One-time**: Only run migration script once
- **Verify**: Test thoroughly before deleting old data

---

## 🔍 Troubleshooting

**"Cannot find module 'firebase-admin'"**
- The script uses the already-installed `firebase-admin` package

**"coupleId is undefined"**
- Make sure you've linked with a partner first
- Refresh the page and try getting coupleId again

**"Permission denied"**
- Ensure Firebase Admin credentials are correct in `.env.local`
- Check service account has proper permissions

---

## ✅ Checklist

- [ ] Signed up both accounts
- [ ] Linked partners with invite code
- [ ] Got coupleId from browser console
- [ ] Downloaded service account JSON
- [ ] Updated `YOUR_COUPLE_ID` in migration script
- [ ] Ran migration script successfully
- [ ] Verified memories appear in dashboard
- [ ] Deployed Firestore rules
- [ ] Tested all features
- [ ] Deleted old memories collection (optional)
