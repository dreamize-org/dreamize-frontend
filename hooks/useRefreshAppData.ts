'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { useRoadmaps } from '@/contexts/RoadmapContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useBooking } from '@/contexts/BookingContext';
import { useUsers } from '@/contexts/UserContext';
import { UserRole } from '@/types';

/**
 * Refreshes user session + domain caches after login, logout, or mutations (payments, bookings, etc.).
 */
export function useRefreshAppData() {
  const { user, syncSessionUser, fetchOnboardingChecklist } = useAuth();
  const { refreshFinancialData } = useFinancial();
  const { refreshRoadmaps } = useRoadmaps();
  const { refreshProjects } = useProjects();
  const { refreshBookings } = useBooking();
  const { refreshUsers } = useUsers();

  const refreshAfterStudentMutation = useCallback(async () => {
    await Promise.all([
      syncSessionUser(),
      fetchOnboardingChecklist(),
      refreshFinancialData(),
      refreshRoadmaps(),
      refreshProjects(),
      refreshBookings(),
    ]);
  }, [
    syncSessionUser,
    fetchOnboardingChecklist,
    refreshFinancialData,
    refreshRoadmaps,
    refreshProjects,
    refreshBookings,
  ]);

  const refreshForCurrentUser = useCallback(async () => {
    const refreshedUser = await syncSessionUser();
    const role = refreshedUser?.role ?? user?.role;

    const tasks: Promise<unknown>[] = [refreshRoadmaps(), refreshProjects()];

    if (role === UserRole.STUDENT) {
      tasks.push(fetchOnboardingChecklist(), refreshFinancialData(), refreshBookings());
    } else if (role === UserRole.TRAINER) {
      tasks.push(refreshUsers(), refreshBookings());
    } else if (role === UserRole.ADMIN) {
      tasks.push(refreshUsers());
    }

    await Promise.all(tasks);
  }, [
    syncSessionUser,
    user?.role,
    refreshRoadmaps,
    refreshProjects,
    fetchOnboardingChecklist,
    refreshFinancialData,
    refreshBookings,
    refreshUsers,
  ]);

  return {
    refreshAfterStudentMutation,
    refreshForCurrentUser,
  };
}
