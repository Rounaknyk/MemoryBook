'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateInviteCode, acceptInvite } from '@/app/actions/partner-linking';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { motion } from 'framer-motion';
import Loading from '@/components/Loading';

export default function LinkPartnerPage() {
    const { user, hasPartner, refreshUserProfile } = useAuth();
    const [inviteCode, setInviteCode] = useState('');
    const [myInviteCode, setMyInviteCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function loadInviteCode() {
            if (!user) {
                router.push('/login');
                return;
            }

            // If already has partner, redirect to dashboard
            if (hasPartner) {
                router.push('/dashboard');
                return;
            }

            // Get or create invite code for this user
            try {
                const code = await getOrCreateInviteCode(user.uid);
                setMyInviteCode(code);
            } catch (err) {
                console.error('Error loading invite code:', err);
            } finally {
                setLoading(false);
            }
        }

        loadInviteCode();
    }, [user, hasPartner, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        if (!user) return;

        try {
            const result = await acceptInvite(inviteCode.toUpperCase(), user.uid, user.email!);

            if (!result.success) {
                setError(result.error || 'Failed to link partner');
                setSubmitting(false);
                return;
            }

            // Set custom claim
            await fetch('/api/auth/set-custom-claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    coupleId: result.coupleId,
                }),
            });

            setSuccess('Partner linked successfully! Redirecting...');

            // Refresh user profile to get the coupleId
            await refreshUserProfile();

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to link partner');
            setSubmitting(false);
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(myInviteCode);
        setSuccess('Invite code copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2 text-center">
                        Link Your Partner 💕
                    </h1>
                    <p className="text-gray-600 text-center mb-8">
                        Connect with your partner to start creating memories together
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Share Your Invite Code */}
                        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                📨 Share Your Code
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Send this code to your partner so they can link with you:
                            </p>

                            <div className="bg-white p-4 rounded-lg mb-4 border-2 border-pink-200">
                                <p className="text-3xl font-bold text-center text-pink-500 tracking-widest">
                                    {myInviteCode}
                                </p>
                            </div>

                            <Button onClick={copyInviteCode} fullWidth variant="outline">
                                📋 Copy Code
                            </Button>
                        </div>

                        {/* Enter Partner's Code */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                🔗 Enter Partner's Code
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Enter the invite code your partner shared with you:
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="text"
                                    label="Invite Code"
                                    placeholder="ABC123"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    required
                                    maxLength={6}
                                    className="uppercase"
                                />

                                <Button type="submit" loading={submitting} fullWidth>
                                    Link Partner
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                        >
                            {success}
                        </motion.div>
                    )}

                    {/* Info Box */}
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong>ℹ️ How it works:</strong>
                            <br />
                            1. Share your invite code with your partner
                            <br />
                            2. Your partner enters your code on their account
                            <br />
                            3. Once linked, you'll both access the same memories
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
