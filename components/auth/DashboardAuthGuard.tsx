'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isReady } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDF9F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
