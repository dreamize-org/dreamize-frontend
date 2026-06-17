'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/auth/routes';

export function useRequireRole(allowedRole: string | string[]) {
  const rolesKey = Array.isArray(allowedRole) ? allowedRole.join('|') : allowedRole;
  const allowedRoles = useMemo(
    () => (Array.isArray(allowedRole) ? allowedRole : [allowedRole]),
    [rolesKey]
  );
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const redirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let target: string | null = null;
    if (!isAuthenticated || !user) {
      target = '/auth/login';
    } else if (!allowedRoles.includes(user.role)) {
      target = getDashboardRoute(user.role);
    }

    if (target && redirectRef.current !== target) {
      redirectRef.current = target;
      router.replace(target);
    }
  }, [authLoading, isAuthenticated, user?._id, user?.role, rolesKey, router, allowedRoles]);

  const isAuthorized =
    !authLoading &&
    isAuthenticated &&
    Boolean(user && allowedRoles.includes(user.role));

  return { user, authLoading, isAuthorized };
}
