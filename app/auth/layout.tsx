'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AUTH_PAGES_VERIFIED_USERS_LEAVE = [
  '/auth/login',
  '/auth/signup',
  '/auth/verify',
  '/auth/student/register',
  '/auth/student/details',
  '/auth/trainer/register',
  '/auth/trainer/details',
  '/auth/forgot-password',
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, handleDashboardRedirect } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user?.isVerified) return;

    const shouldLeaveAuthFlow = AUTH_PAGES_VERIFIED_USERS_LEAVE.some((path) =>
      pathname.startsWith(path)
    );

    if (shouldLeaveAuthFlow) {
      handleDashboardRedirect();
    }
  }, [user, user?.isVerified, pathname, handleDashboardRedirect]);

  return children;
}
