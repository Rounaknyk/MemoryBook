'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    coupleId: string | null;
    hasPartner: boolean;
    partnerEmail: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [coupleId, setCoupleId] = useState<string | null>(null);
    const [hasPartner, setHasPartner] = useState(false);
    const [partnerEmail, setPartnerEmail] = useState<string | null>(null);

    const fetchUserProfile = async (firebaseUser: User) => {
        try {
            // Get user profile from Firestore
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                setCoupleId(userData.coupleId || null);
                setHasPartner(!!userData.coupleId);

                // If user has a couple, fetch partner info
                if (userData.coupleId) {
                    const coupleRef = doc(db, 'couples', userData.coupleId);
                    const coupleSnap = await getDoc(coupleRef);

                    if (coupleSnap.exists()) {
                        const coupleData = coupleSnap.data();
                        // Find partner email
                        const partnerEmailValue = coupleData.partner1Email === firebaseUser.email
                            ? coupleData.partner2Email
                            : coupleData.partner1Email;
                        setPartnerEmail(partnerEmailValue);
                    }
                }
            } else {
                setCoupleId(null);
                setHasPartner(false);
                setPartnerEmail(null);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setCoupleId(null);
            setHasPartner(false);
            setPartnerEmail(null);
        }
    };

    useEffect(() => {
        // Set persistence to LOCAL for session persistence
        setPersistence(auth, browserLocalPersistence);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                await fetchUserProfile(firebaseUser);
            } else {
                setCoupleId(null);
                setHasPartner(false);
                setPartnerEmail(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
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

    const signUp = async (email: string, password: string, displayName?: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user profile directly in Firestore (client-side)
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email,
                displayName: displayName || null,
                coupleId: null,
                inviteCode: null,
                createdAt: new Date(),
            });

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('This email is already registered.');
            } else if (error.code === 'auth/weak-password') {
                throw new Error('Password should be at least 6 characters.');
            } else if (error.code === 'auth/invalid-email') {
                throw new Error('Invalid email address.');
            }
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setCoupleId(null);
            setHasPartner(false);
            setPartnerEmail(null);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const refreshUserProfile = async () => {
        if (user) {
            await fetchUserProfile(user);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            coupleId,
            hasPartner,
            partnerEmail,
            signIn,
            signUp,
            signOut,
            refreshUserProfile
        }}>
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
