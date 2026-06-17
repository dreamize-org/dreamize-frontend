export const STUDENT_LEARNING_PATH_PREFIXES = [
  '/dashboard/student/roadmap',
  '/dashboard/student/projects',
  '/dashboard/student/chat',
  '/dashboard/student/calendar',
  '/dashboard/student/portfolio',
  '/dashboard/student/certificates',
];

export const STUDENT_ALWAYS_ALLOWED_PREFIXES = [
  '/dashboard/student/pay',
  '/dashboard/student/subscription',
  '/dashboard/student/profile',
  '/dashboard/student/settings',
  '/dashboard/student/notifications',
];

export function isStudentLearningPath(pathname: string) {
  return STUDENT_LEARNING_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function requiresActiveSubscription(pathname: string) {
  if (!pathname.startsWith('/dashboard/student')) return false;
  if (pathname === '/dashboard/student' || pathname === '/dashboard/student/') return false;
  if (STUDENT_ALWAYS_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  return isStudentLearningPath(pathname);
}

export type SubscriptionColorCode = 'green' | 'yellow' | 'red' | 'gray';

export function getSubscriptionColorClasses(colorCode: SubscriptionColorCode) {
  switch (colorCode) {
    case 'green':
      return {
        badge: 'bg-green-100 text-green-800',
        bar: 'bg-green-500',
        text: 'text-green-700',
      };
    case 'yellow':
      return {
        badge: 'bg-yellow-100 text-yellow-800',
        bar: 'bg-yellow-500',
        text: 'text-yellow-700',
      };
    case 'red':
      return {
        badge: 'bg-red-100 text-red-800',
        bar: 'bg-red-500',
        text: 'text-red-700',
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-700',
        bar: 'bg-gray-400',
        text: 'text-gray-600',
      };
  }
}

export function getSubscriptionColorFromDays(daysRemaining: number): SubscriptionColorCode {
  if (daysRemaining > 20) return 'green';
  if (daysRemaining >= 7) return 'yellow';
  if (daysRemaining > 0) return 'red';
  return 'gray';
}

export function getSubscriptionStatusLabel(colorCode: SubscriptionColorCode, daysRemaining: number) {
  if (colorCode === 'gray') return 'Expired';
  if (daysRemaining === 1) return '1 day left';
  return `${daysRemaining} days left`;
}
