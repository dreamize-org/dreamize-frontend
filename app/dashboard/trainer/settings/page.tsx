'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types/user';
import { Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts';
import { authService } from '@/services/auth';

export default function TrainerSettingsPage() {
    const { logout } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleUpdatePassword = async () => {
        setMessage(null);

        if (!newPassword || newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setIsSaving(true);
        try {
            await authService.resetPassword(newPassword);
            setNewPassword('');
            setConfirmPassword('');
            setMessage({ type: 'success', text: 'Password updated successfully.' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to update password.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
            <Sidebar activeItem="Settings" userType={UserRole.TRAINER} />

            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-playfair font-semibold text-slate-900 mb-2">Trainer Settings</h1>
                            <p className="text-slate-500 font-light">Manage your account security.</p>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-slate-700" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-playfair font-semibold text-slate-900">Security</h3>
                                    <p className="text-sm text-slate-500">Set a new password for your account.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:bg-white focus:border-primary/20 focus:ring-0 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:bg-white focus:border-primary/20 focus:ring-0 transition-all"
                                    />
                                </div>
                            </div>

                            {message && (
                                <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {message.text}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm hover:bg-slate-800 shadow-md disabled:opacity-50"
                                >
                                    {isSaving ? 'Updating...' : 'Update Password'}
                                </button>
                                <button
                                    onClick={() => logout()}
                                    className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-all text-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
