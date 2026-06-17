'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/hooks/useRouter';
import { getDashboardRoute, getPostAuthRoute } from '@/lib/auth/routes';
import { UserRole } from '@/types';

interface UseRequireAuthOptions {
  allowedRoles?: UserRole[];
}

export function useRequireAuth(options?: UseRequireAuthOptions) {
  const { user, authStatus, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || authStatus === 'loading') return;

    if (authStatus === 'guest') {
      router.push('/auth/login');
      return;
    }

    if (authStatus === 'verify') {
      router.push('/auth/verify');
      return;
    }

    if (authStatus === 'pending') {
      router.push('/auth/pending-approval');
      return;
    }

    if (user && options?.allowedRoles?.length && !options.allowedRoles.includes(user.role as UserRole)) {
      router.push(getDashboardRoute(user.role));
    }
  }, [authStatus, isLoading, options?.allowedRoles, pathname, router, user]);

  const isReady = authStatus === 'ready';

  return {
    user,
    isLoading: isLoading || authStatus === 'loading',
    isReady,
    authStatus,
  };
}

export function useRedirectIfAuthenticated() {
  const { user, authStatus, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || authStatus === 'loading' || !user) return;

    if (authStatus === 'verify') {
      if (!pathname.startsWith('/auth/verify')) {
        router.push('/auth/verify');
      }
      return;
    }

    if (authStatus === 'pending') {
      if (!pathname.startsWith('/auth/pending-approval')) {
        router.push('/auth/pending-approval');
      }
      return;
    }

    if (authStatus === 'ready' && pathname.startsWith('/auth/')) {
      const stayPaths = ['/auth/reset-password', '/auth/guardian/set-password'];
      if (stayPaths.some((path) => pathname.startsWith(path))) return;
      router.push(getPostAuthRoute(user));
    }
  }, [authStatus, isLoading, pathname, router, user]);
}
