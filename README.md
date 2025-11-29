# 📖 MemoryBook

**A beautiful, AI-powered digital memory journal for couples to capture, organize, and relive their special moments together.**

---

## 🌟 Overview

MemoryBook is a modern web application designed specifically for couples who want to preserve their shared memories in a private, organized, and visually stunning space. Unlike generic photo apps, MemoryBook treats each memory as a story—complete with photos, videos, notes, locations, and AI-generated insights.

**Perfect for:**
- 💑 Couples documenting their relationship journey
- 🎉 Preserving special moments, trips, and milestones
- 🗺️ Creating a visual timeline of shared experiences
- 🧠 Reliving "On This Day" memories from years past

---

## ✨ Key Features

### 🔐 **Multi-Couple Platform**
- **Private Spaces**: Each couple has their own secure, isolated memory space
- **Partner Linking**: Simple invite code system to connect with your partner
- **Data Isolation**: Firestore security rules ensure complete privacy between couples

### 📸 **Rich Memory Capture**
- **Multimedia Support**: Upload photos and videos (via Cloudinary CDN)
- **Location Tracking**: Tag memories with precise locations using Google Maps
- **Activity Tags**: Categorize memories (dates, travel, celebrations, etc.)
- **Multiple Notes**: Add detailed notes and reflections to each memory
- **Date Flexibility**: Assign custom dates to memories from any time

### 🤖 **AI-Powered Insights**
- **Smart Captions**: Gemini AI generates contextual, heartfelt captions
- **Memory Enhancements**: AI suggests tags, sentiments, and themes
- **Natural Language**: Conversational AI that understands relationship context

### 📅 **Interactive Calendar**
- **Visual Timeline**: See all memories on a beautiful calendar interface
- **Memory Density**: Days with memories are highlighted
- **Quick Navigation**: Jump to any date to view associated memories
- **Seasonal View**: Browse by month and year

### 🖼️ **Stunning Gallery**
- **Masonry Layout**: Pinterest-style responsive image grid
- **Media Filtering**: Sort by photos vs. videos
- **Full-Screen Viewer**: Immersive memory viewing experience
- **Lazy Loading**: Optimized performance with progressive image loading

### 🗺️ **Interactive Map**
- **Geolocation**: Plot all memory locations on Google Maps
- **Cluster View**: Group nearby memories for clarity
- **Location Cards**: Preview memories by clicking map markers
- **Travel Visualization**: See your journey together across cities/countries

### ⏰ **Time Machine**
- **"On This Day"**: Surface memories from exactly 1, 2, 3+ years ago
- **Nostalgia Engine**: Automated daily reminders of past moments
- **Anniversary Tracking**: Celebrate recurring dates automatically

### 🎨 **Modern Design**
- **Glassmorphism UI**: Premium, translucent card designs
- **Gradient Accents**: Vibrant purple-to-pink color scheme
- **Smooth Animations**: Framer Motion micro-interactions
- **Responsive Layout**: Perfect on desktop, tablet, and mobile
- **Dark Mode Ready**: Eye-friendly color palette

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Day Picker** - Calendar component

### **Backend & Database**
- **Firebase Authentication** - Secure email/password auth
- **Firestore** - NoSQL database with real-time sync
- **Firebase Admin SDK** - Server-side operations
- **Custom Claims** - Couple-scoped access control

### **Media & Storage**
- **Cloudinary** - Image/video CDN with transformations
- **Couple-Scoped Folders** - Organized `couples/{coupleId}/memories/` structure

### **AI & APIs**
- **Google Gemini AI** - Smart caption generation
- **Google Maps API** - Location services and visualization

### **DevOps**
- **Vercel/Firebase Hosting** - Deployment platform
- **Git/GitHub** - Version control

---

## 🏗️ Architecture

### **Data Model**

```
firestore/
├── users/{userId}
│   ├── email
│   ├── displayName
│   ├── coupleId
│   └── inviteCode
│
├── couples/{coupleId}
│   ├── userIds[]
│   ├── partner1Email
│   ├── partner2Email
│   └── memories/{memoryId}
│       ├── date
│       ├── title
│       ├── caption
│       ├── notes[]
│       ├── imageUrls[]
│       ├── location {lat, lng, address}
│       ├── activityTags[]
│       ├── userId
│       └── timestamps
```

### **Security Model**
- **Custom JWT Claims**: `coupleId` injected into Firebase Auth tokens
- **Firestore Rules**: Enforce couple-scoped read/write access
- **Client-Side Guards**: React context prevents unauthorized navigation
- **Server Actions**: `'use server'` for sensitive operations

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- Firebase project (Authentication + Firestore enabled)
- Cloudinary account
- Google Maps API key
- Google Gemini API key

### **1. Clone & Install**
```bash
git clone https://github.com/yourusername/MemoryBook.git
cd MemoryBook
npm install
```

### **2. Environment Variables**
Create `.env.local`:
```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (for server actions)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Google Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GEMINI_API_KEY=
```

### **3. Deploy Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

### **4. Run Development Server**
```bash
npm run dev
# Visit http://localhost:3000
```

### **5. Build for Production**
```bash
npm run build
npm start
```

---

## 🚀 User Flow

### **First-Time Setup**
1. **Sign Up** → Create account at `/signup`
2. **Link Partner** → Share your 6-digit invite code
3. **Partner Accepts** → They enter your code to link accounts
4. **Start Creating** → Add your first memory together!

### **Daily Usage**
1. **Dashboard** → See recent memories and "Time Machine" suggestions
2. **Add Memory** → Upload photos/videos, write notes, tag location
3. **Browse** → Explore via Calendar, Gallery, or Map views
4. **Relive** → Get daily reminders of past memories

---

## 🎯 Use Cases

### **Romantic Relationships**
- Track relationship milestones (first date, anniversaries)
- Document trips and vacations together
- Preserve everyday moments that matter

### **Long-Distance Couples**
- Share experiences asynchronously
- Feel connected through shared memories
- Plan future trips by reviewing past locations

### **Anniversary Gifts**
- Export memories as a curated timeline
- Create personalized "year in review" summaries
- Print photo books from gallery exports

---

## 🔒 Privacy & Security

- ✅ **End-to-End Encryption**: Firebase Auth tokens
- ✅ **Data Isolation**: Firestore rules prevent cross-couple access
- ✅ **Private by Default**: No public sharing or social features
- ✅ **GDPR Compliant**: User data deletion on account removal
- ✅ **Secure Uploads**: Cloudinary signed uploads

---

## 🌍 Deployment

### **Recommended: Vercel**
```bash
vercel deploy
```

### **Alternative: Firebase Hosting**
```bash
npm run build
firebase deploy --only hosting
```

---

## 📊 Roadmap

### **Planned Features**
- [ ] PDF/Print Export for anniversary gifts
- [ ] Collaborative memory editing
- [ ] Voice notes and audio memories
- [ ] Advanced AI search ("find our beach vacation photos")
- [ ] Memory challenges ("add a memory every day this month")
- [ ] Relationship statistics dashboard
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Open an issue or submit a PR.

---

## 📄 License

MIT License - Feel free to fork and customize for your own use!

---

## 💡 Inspiration

Built with love for couples who believe every moment deserves to be remembered. Inspired by the nostalgia of physical photo albums combined with the power of modern AI and cloud technology.

---

## 📧 Contact

**Developer**: Rounak Naik  
**GitHub**: [@Rounaknyk](https://github.com/Rounaknyk)  
**Project Link**: [https://github.com/Rounaknyk/MemoryBook](https://github.com/Rounaknyk/MemoryBook)

---

<p align="center">Made with 💜 for preserving love stories, one memory at a time.</p>
