'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Lock, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { requiresActiveSubscription } from '@/lib/subscription/access';
import { Student } from '@/types';

export default function StudentLearningGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, authStatus, onboardingChecklist, fetchOnboardingChecklist } = useAuth();
  const { navigate } = useNavigationWithLoading();

  useEffect(() => {
    if (authStatus === 'ready' && user?.role === 'student') {
      fetchOnboardingChecklist().catch(() => undefined);
    }
  }, [authStatus, fetchOnboardingChecklist, pathname, user?.role]);

  if (!requiresActiveSubscription(pathname)) {
    return <>{children}</>;
  }

  if (authStatus !== 'ready' || !user || user.role !== 'student') {
    return <>{children}</>;
  }

  const student = user as Student;
  const hasAccess =
    Boolean(onboardingChecklist?.subscriptionPayed) ||
    Boolean(student.hasActiveSubscription);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-lg w-full bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-2xl font-playfair font-semibold text-slate-900 mb-2">
          Subscription required
        </h2>
        <p className="text-slate-500 font-light mb-6">
          Your mentorship subscription has expired or is not active. Renew to access roadmap,
          projects, chat, calendar, portfolio, and certificates.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard/student/subscription')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800"
          >
            <CreditCard className="w-4 h-4" />
            Manage subscription
          </button>
          <button
            onClick={() => navigate('/dashboard/student/pay/subscription')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50"
          >
            Renew now
          </button>
        </div>
      </div>
    </div>
  );
}
