import { BaseUser, Guardian, GuardianInviteState, Trainer, UserRole } from '@/types';

export const DASHBOARD_ROUTES: Record<string, string> = {
  student: '/dashboard/student',
  trainer: '/dashboard/trainer',
  admin: '/dashboard/admin',
  guardian: '/dashboard/guardian',
  sales_manager: '/dashboard/sales',
};

export type AuthStatus = 'loading' | 'guest' | 'verify' | 'pending' | 'ready';

export function getDashboardRoute(role: string): string {
  return DASHBOARD_ROUTES[role] || '/';
}

export function getPostAuthRoute(user: BaseUser): string {
  if (!user.isVerified) return '/auth/verify';
  if (user.role === UserRole.TRAINER && (user as Trainer).approvalStatus === 'pending') {
    return '/auth/pending-approval';
  }
  if (user.role === UserRole.GUARDIAN && (user as Guardian).inviteState === GuardianInviteState.INVITED) {
    return '/auth/login';
  }
  return getDashboardRoute(user.role);
}

export function resolveAuthStatus(user: BaseUser | null, hasToken: boolean, isLoading: boolean): AuthStatus {
  if (isLoading) return 'loading';
  if (!hasToken || !user) return 'guest';
  if (!user.isVerified) return 'verify';
  if (user.role === UserRole.TRAINER && (user as Trainer).approvalStatus === 'pending') {
    return 'pending';
  }
  if (user.role === UserRole.GUARDIAN && (user as Guardian).inviteState === GuardianInviteState.INVITED) {
    return 'guest';
  }
  return 'ready';
}

export function canAccessDashboard(user: BaseUser | null): boolean {
  return resolveAuthStatus(user, true, false) === 'ready';
}

/** Auth pages verified users should leave (except password reset / guardian invite). */
export const AUTH_ENTRY_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/verify',
  '/auth/student/register',
  '/auth/student/details',
  '/auth/trainer/register',
  '/auth/trainer/details',
  '/auth/forgot-password',
];

export function shouldLeaveAuthFlow(pathname: string): boolean {
  return AUTH_ENTRY_PATHS.some((path) => pathname.startsWith(path));
}
