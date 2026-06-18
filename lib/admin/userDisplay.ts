import { BaseUser, UserRole } from '@/types';

export type UserAccountStatus = 'verified' | 'pending' | 'suspended';

export function getUserAccountStatus(user: BaseUser): UserAccountStatus {
  if (!user.isActive) return 'suspended';
  if (!user.isVerified) return 'pending';
  return 'verified';
}

export function formatUserRole(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return 'Student';
    case UserRole.TRAINER:
      return 'Trainer';
    case UserRole.ADMIN:
      return 'Admin';
    case UserRole.GUARDIAN:
      return 'Guardian';
    case UserRole.SALES_MANAGER:
      return 'Sales Manager';
    default:
      return String(role).replace(/_/g, ' ');
  }
}

export function getRoleBadgeClasses(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case UserRole.TRAINER:
      return 'bg-purple-50 text-purple-700 border-purple-100';
    case UserRole.GUARDIAN:
      return 'bg-teal-50 text-teal-700 border-teal-100';
    case UserRole.ADMIN:
      return 'bg-slate-900 text-white border-slate-800';
    case UserRole.SALES_MANAGER:
      return 'bg-amber-50 text-amber-800 border-amber-100';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getStatusBadgeClasses(status: UserAccountStatus): string {
  switch (status) {
    case 'verified':
      return 'bg-green-50 text-green-700 border-green-100';
    case 'pending':
      return 'bg-orange-50 text-orange-700 border-orange-100';
    case 'suspended':
      return 'bg-red-50 text-red-700 border-red-100';
  }
}

export function getStatusLabel(status: UserAccountStatus): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'pending':
      return 'Pending';
    case 'suspended':
      return 'Suspended';
  }
}

export function getAvatarColor(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return 'bg-blue-500';
    case UserRole.TRAINER:
      return 'bg-purple-500';
    case UserRole.GUARDIAN:
      return 'bg-teal-500';
    case UserRole.ADMIN:
      return 'bg-slate-900';
    case UserRole.SALES_MANAGER:
      return 'bg-amber-500';
    default:
      return 'bg-slate-400';
  }
}

export function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
