# MemoryBook 💕

A beautiful, private shared journal web application for two people to capture and cherish their memories together. Built with Next.js, Firebase, and Cloudinary.

![MemoryVault](./public/screenshot-placeholder.png)

## ✨ Features

- 🔐 **Secure Authentication** - Firebase Auth with email whitelist (only allowed users can sign in)
- 📅 **Interactive Calendar** - Browse memories by date with visual indicators
- 🖼️ **Memory Gallery** - Beautiful grid layout of all your captured moments
- 📝 **Rich Memory Creation** - Add photos, captions, and multiple notes to each memory
- ✏️ **Edit & Delete** - Full CRUD operations for managing your memories
- 🎨 **Beautiful UI** - Romantic pastel theme with smooth Framer Motion animations
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ☁️ **Cloud Storage** - Images hosted on Cloudinary, data stored in Firestore

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS with custom pastel color palette
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Image Storage**: Cloudinary
- **Date Handling**: date-fns
- **Calendar**: react-day-picker

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm installed
- A [Firebase](https://firebase.google.com/) account
- A [Cloudinary](https://cloudinary.com/) account
- Two email addresses for the allowed users

## 🚀 Getting Started

### 1. Clone and Install

\`\`\`bash
cd /Users/rounaknaik/nextProjects/MemoryBook
npm install
\`\`\`

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
   - Add the two allowed email addresses as users
4. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **production mode**
   - Choose your preferred location
5. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Add web app
   - Copy the firebaseConfig values

### 3. Cloudinary Setup

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Sign up or log in
3. Go to Dashboard to find:
   - Cloud Name
   - API Key
   - API Secret
4. (Optional) Create an upload preset:
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set "Signing Mode" to "Unsigned"
   - Note the preset name (default: "ml_default")

### 4. Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your values:

\`\`\`env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Allowed emails (Rounak & Sarika)
NEXT_PUBLIC_ALLOWED_EMAIL_1=email1@example.com
NEXT_PUBLIC_ALLOWED_EMAIL_2=email2@example.com
\`\`\`

### 5. Deploy Firestore Security Rules

Copy the contents of \`firestore.rules\` and paste into Firebase Console:

1. Go to Firestore Database → Rules
2. Replace the existing rules with the contents of \`firestore.rules\`
3. Click "Publish"

Alternatively, use Firebase CLI:

\`\`\`bash
npm install -g firebase-tools
firebase login
firebase init firestore  # Select your project
firebase deploy --only firestore:rules
\`\`\`

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
MemoryBook/
├── app/
│   ├── actions/
│   │   └── memories.ts          # Server actions for CRUD operations
│   ├── dashboard/
│   │   ├── calendar/
│   │   │   └── page.tsx         # Calendar view
│   │   ├── gallery/
│   │   │   └── page.tsx         # Memory gallery
│   │   ├── memory/
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Create memory
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Memory detail
│   │   │       └── edit/
│   │   │           └── page.tsx # Edit memory
│   │   ├── layout.tsx           # Dashboard layout
│   │   └── page.tsx             # Dashboard home
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Root page (redirect)
├── components/
│   ├── Button.tsx               # Reusable button
│   ├── Input.tsx                # Reusable input
│   ├── Loading.tsx              # Loading spinner
│   └── Modal.tsx                # Modal dialog
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── lib/
│   ├── cloudinary.ts            # Cloudinary utilities
│   └── firebase.ts              # Firebase configuration
├── types/
│   └── memory.ts                # TypeScript types
├── firestore.rules              # Firestore security rules
├── .env.example                 # Environment variables template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # TailwindCSS configuration
└── package.json
\`\`\`

## 🔒 Firestore Security Rules

The application uses comprehensive security rules to ensure data protection:

- ✅ Only authenticated users can access memories
- ✅ Only memory owners can edit or delete their memories
- ✅ Schema validation ensures data integrity
- ✅ User profiles can only be edited by their owners

See \`firestore.rules\` for the complete ruleset.

## 📡 API / Server Actions

The app uses Next.js Server Actions for database operations:

### Memory Operations

- **createMemory(data)** - Create a new memory
- **updateMemory(id, data)** - Update an existing memory
- **deleteMemory(id)** - Delete a memory
- **getMemoryById(id)** - Get a single memory
- **getMemoryByDate(date)** - Get memory for a specific date
- **getAllMemories()** - Get all memories (sorted by date)
- **getRecentMemories(count)** - Get N most recent memories
- **getMemoriesByMonth(year, month)** - Get all memory dates in a month

All actions are located in \`app/actions/memories.ts\`.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables from \`.env.local\`
5. Deploy!

Vercel will automatically:
- Detect Next.js
- Install dependencies
- Build and deploy your app

### Environment Variables on Vercel

Add all variables from your \`.env.local\` file to Vercel:

1. Go to your project → Settings → Environment Variables
2. Add each variable one by one
3. Redeploy if needed

## 📸 Screenshots

### Login Page
![Login](./public/login-screenshot.png)

### Dashboard
![Dashboard](./public/dashboard-screenshot.png)

### Calendar View
![Calendar](./public/calendar-screenshot.png)

### Memory Detail
![Memory Detail](./public/detail-screenshot.png)

### Gallery
![Gallery](./public/gallery-screenshot.png)

## 🎨 Design System

### Color Palette

\`\`\`css
--pastel-pink: #FFD6E8
--pastel-lavender: #E6E6FA
--pastel-peach: #FFE5D9
--pastel-mint: #D4F1E8
--pastel-blue: #D6E9FF
--pastel-rose: #FFE4E9
\`\`\`

### Typography

- Font Family: Inter
- Headings: 600-700 weight
- Body: 400 weight

## 🤝 Contributing

This is a private application for two users. However, you can fork and customize it for your own use!

## 📝 License

Private project - All rights reserved.

## 💖 Made with Love

Created for Rounak & Sarika to preserve their beautiful memories together.

---

**Need help?** Check the Firebase and Cloudinary documentation or review the code comments for guidance.
