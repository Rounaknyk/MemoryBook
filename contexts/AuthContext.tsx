'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
} from 'firebase/auth';
import { auth, isEmailAllowed } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set persistence to LOCAL for session persistence
        setPersistence(auth, browserLocalPersistence);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Verify user email is allowed
            if (user && user.email && !isEmailAllowed(user.email)) {
                // Immediately sign out if email is not in whitelist
                firebaseSignOut(auth);
                setUser(null);
            } else {
                setUser(user);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        // Check if email is allowed before attempting sign in
        if (!isEmailAllowed(email)) {
            throw new Error('This email is not authorized to access this application.');
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            // Provide user-friendly error messages
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                throw new Error('Invalid email or password.');
            } else if (error.code === 'auth/too-many-requests') {
                throw new Error('Too many failed attempts. Please try again later.');
            } else if (error.code === 'auth/network-request-failed') {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
