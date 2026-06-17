'use client';

import { useRouter } from '@/hooks/useRouter';;
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { Clock, Mail, MessageSquare, LogOut, ArrowLeft, Hourglass } from 'lucide-react';
import { useAuth } from '@/contexts';
import { PremiumButton } from '@/components/ui/premium-button';

export default function PendingApprovalContent() {
    const router = useRouter();
    const { logout, user } = useAuth();

    const email = user?.email ? user.email : 'your email address';

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    const handleBackToLogin = async () => {
        await logout();
        router.push('/auth/login');
    };

    return (
        <AuthContainer>
            <AuthCard 
                title="Application Under Review" 
                subtitle="Your trainer application is currently being processed by our team."
            >
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                            <Hourglass className="w-10 h-10 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-primary/20">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
                        <span className="font-bold text-slate-800 text-[14px] uppercase tracking-wider break-words">Status: Pending Approval</span>
                    </div>

                    <div className="space-y-4 text-[14px] text-slate-600">
                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 mt-0.5 text-primary/60" />
                            <p>Review typically takes <strong className="text-slate-900">1-3 business days</strong></p>
                        </div>
                        <div className="flex items-start gap-3 min-w-0">
                            <Mail className="w-4 h-4 mt-0.5 text-primary/60" />
                            <p className="min-w-0 break-all">Notification will be sent to <strong className="text-slate-900">{email}</strong></p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 mb-8">
                    <h3 className="text-[15px] font-bold text-slate-800 ml-1">What to expect next?</h3>
                    
                    <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                        <div className="flex gap-4 relative z-10">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/20 mt-1">
                                <span className="text-white text-[11px] font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-slate-800">Document Review</h4>
                                <p className="text-[13px] text-slate-500 font-light">Our team verifies your credentials and experience</p>
                            </div>
                        </div>

                        <div className="flex gap-4 relative z-10">
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mt-1">
                                <span className="text-slate-400 text-[11px] font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-slate-400">Background Check</h4>
                                <p className="text-[13px] text-slate-400 font-light italic">Queued for verification</p>
                            </div>
                        </div>

                        <div className="flex gap-4 relative z-10">
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mt-1">
                                <span className="text-slate-400 text-[11px] font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-slate-400">Onboarding Access</h4>
                                <p className="text-[13px] text-slate-400 font-light">Activation of trainer dashboard</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <PremiumButton onClick={handleBackToLogin}>
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back to Login
                    </PremiumButton>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-red-500 transition-all text-[14px] font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                <div className="mt-10 text-center">
                    <button className="inline-flex items-center gap-2 text-[13px] text-slate-400 hover:text-primary transition-colors font-medium underline underline-offset-4 decoration-primary/20">
                        <MessageSquare className="w-4 h-4" />
                        Need help? Contact Support
                    </button>
                </div>

                <div className="mt-12 text-center text-[12px] text-slate-300 uppercase tracking-widest font-bold">
                    © Dreamize 2025
                </div>
            </AuthCard>
        </AuthContainer>
    );
}
