'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCoupleSettings, updateCoupleSettings } from '@/app/actions/settings';
import Toggle from '@/components/Toggle';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const { coupleId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function loadSettings() {
            if (!coupleId) return;

            try {
                const settings = await getCoupleSettings(coupleId);
                setEmailEnabled(settings.emailNotificationsEnabled);
            } catch (error) {
                console.error('Failed to load settings', error);
                setMessage({ type: 'error', text: 'Failed to load settings' });
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, [coupleId]);

    const handleToggle = async (enabled: boolean) => {
        if (!coupleId) return;

        setEmailEnabled(enabled); // Optimistic update
        setSaving(true);
        setMessage(null);

        try {
            const result = await updateCoupleSettings(coupleId, enabled);
            if (result.success) {
                setMessage({ type: 'success', text: 'Settings updated successfully' });
            } else {
                setEmailEnabled(!enabled); // Revert on failure
                setMessage({ type: 'error', text: 'Failed to update settings' });
            }
        } catch (error) {
            setEmailEnabled(!enabled); // Revert on failure
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setSaving(false);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage((prev) => (prev?.type === 'success' ? null : prev));
            }, 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
                <p className="text-gray-600 mb-8">Manage your shared preferences</p>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-xl font-semibold mb-6">Notifications</h2>

                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <Toggle
                            enabled={emailEnabled}
                            onChange={handleToggle}
                            label="Email Notifications"
                            description="Receive an email when your partner posts a new memory. This setting is shared."
                            disabled={!coupleId || saving}
                        />
                    </div>

                    {message && (
                        <div
                            className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {!coupleId && (
                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm mt-4">
                            You need to be linked with a partner to manage these settings.
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
