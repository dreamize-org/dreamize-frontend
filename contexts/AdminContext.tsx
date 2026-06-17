'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BaseUser, Trainer, UserRole } from '@/types/user';
import { adminService, AdminPayment, type FeedbackTicket, type AdminAnalytics } from '@/services/admin';
import { useAdmin, CreateUserData, UserStatus } from '@/hooks/useAdmin';
import { useAuth } from './AuthContext';

interface AdminContextType {
  // Users
  users: BaseUser[];
  usersLoading: boolean;
  usersError: string | null;
  refreshUsers: () => Promise<void>;
  // Trainers
  trainers: Trainer[];
  pendingTrainers: Trainer[];
  trainersLoading: boolean;
  trainersError: string | null;
  refreshTrainers: () => Promise<void>;
  // Payments
  payments: AdminPayment[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  refreshPayments: () => Promise<void>;
  // Analytics
  analytics: AdminAnalytics | null;
  analyticsLoading: boolean;
  analyticsError: string | null;
  refreshAnalytics: () => Promise<void>;
  // Feedback
  tickets: FeedbackTicket[];
  ticketsLoading: boolean;
  ticketsError: string | null;
  refreshTickets: () => Promise<void>;
  
  // Admin hook operations
  createUser: (data: CreateUserData) => Promise<BaseUser | null>;
  updateUser: (id: string, data: Partial<BaseUser>) => Promise<BaseUser | null>;
  deleteUser: (id: string) => Promise<boolean>;
  updateUserStatus: (id: string, status: UserStatus) => Promise<void>;
  filterByRole: (users: BaseUser[], role: UserRole) => BaseUser[];
  approveTrainer: (id: string, approvedBy: string) => Promise<void>;
  rejectTrainer: (id: string, rejectionReason: string) => Promise<void>;
  deleteTrainer: (id: string) => Promise<void>;
  getPaymentDetails: (id: string) => Promise<AdminPayment | null>;
  filterPaymentsByStatus: (payments: AdminPayment[], status: string) => AdminPayment[];
  filterPaymentsByField: (payments: AdminPayment[], fieldId: string) => AdminPayment[];
  updateTicketStatus: (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') => Promise<void>;
  addAdminResponse: (id: string, response: string) => Promise<void>;
  getAnalytics: () => Promise<AdminAnalytics | null>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const adminHook = useAdmin();
  
  // State
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [pendingTrainers, setPendingTrainers] = useState<Trainer[]>([]);
  const [trainersLoading, setTrainersLoading] = useState(false);
  const [trainersError, setTrainersError] = useState<string | null>(null);
  
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  
  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const adminUserId = user?._id;
  const isAdmin = user?.role === 'admin';

  const refreshUsers = async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data ?? []);
      setUsersError(null);
    } catch {
      setUsersError('Failed to fetch users');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const refreshTrainers = async () => {
    if (!isAdmin) return;
    setTrainersLoading(true);
    try {
      // Get all trainers and filter for pending ones
      const trainersRes = await adminService.getTrainers();
      const allTrainers = trainersRes.data ?? [];
      setTrainers(allTrainers);

      // Filter pending trainers
      const pendingTrainersRes =await adminService.getPendingTrainers()
      setPendingTrainers(pendingTrainersRes.data ?? []);

      setTrainersError(null);
    } catch (err) {
      setTrainersError(err instanceof Error ? err.message : 'Failed to load trainers');
      setTrainers([]);
      setPendingTrainers([]);
    } finally {
      setTrainersLoading(false);
    }
  };

  const refreshPayments = async () => {
    if (!isAdmin) return;
    setPaymentsLoading(true);
    try {
      const res = await adminService.getPayments();
      setPayments(res.data ?? []);
      setPaymentsError(null);
    } catch (err) {
      setPaymentsError(err instanceof Error ? err.message : 'Failed to load payments');
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    if (!isAdmin) return;
    setAnalyticsLoading(true);
    try {
      const res = await adminService.getAnalytics();
      setAnalytics(res.data ?? null);
      setAnalyticsError(null);
    } catch (err) {
      setAnalyticsError(err instanceof Error ? err.message : 'Failed to load analytics');
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const refreshTickets = async () => {
    if (!isAdmin) return;
    setTicketsLoading(true);
    try {
      const res = await adminService.getFeedbackTickets();
      setTickets(res.data ?? []);
      setTicketsError(null);
    } catch (err) {
      setTicketsError(err instanceof Error ? err.message : 'Failed to load tickets');
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || !adminUserId) return;
    refreshUsers();
    refreshTrainers();
    refreshPayments();
    refreshAnalytics();
    refreshTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminUserId, isAdmin]);

  return (
    <AdminContext.Provider value={{
      users, usersLoading, usersError, refreshUsers,
      trainers, pendingTrainers, trainersLoading, trainersError, refreshTrainers,
      payments, paymentsLoading, paymentsError, refreshPayments,
      analytics, analyticsLoading, analyticsError, refreshAnalytics,
      tickets, ticketsLoading, ticketsError, refreshTickets,
      // Admin hook operations
      createUser: adminHook.createUser,
      updateUser: adminHook.updateUser,
      deleteUser: adminHook.deleteUser,
      updateUserStatus: adminHook.updateUserStatus,
      filterByRole: adminHook.filterByRole,
      approveTrainer: adminHook.approveTrainer,
      rejectTrainer: adminHook.rejectTrainer,
      deleteTrainer: adminHook.deleteTrainer,
      getPaymentDetails: adminHook.getPaymentDetails,
      filterPaymentsByStatus: adminHook.filterPaymentsByStatus,
      filterPaymentsByField: adminHook.filterPaymentsByField,
      updateTicketStatus: adminHook.updateTicketStatus,
      addAdminResponse: adminHook.addAdminResponse,
      getAnalytics: adminHook.getAnalytics,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdminContext must be used within an AdminProvider');
  return context;
}
