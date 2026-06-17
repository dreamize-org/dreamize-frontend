import { useState } from 'react';
import { apiClient } from '@/services/client';
import { API_ENDPOINTS } from '@/services/constants';
import { BaseUser, UserRole } from '@/types';
import { adminService, AdminPayment, FeedbackTicket, type AdminAnalytics } from '@/services/admin';
import { Roadmap } from '@/types/roadmap';

// Types
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'paused';

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  fieldId?: string;
}

// Using AdminPayment from admin service instead

interface UseAdminReturn {
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Users Management
  createUser: (data: CreateUserData) => Promise<BaseUser | null>;
  updateUser: (id: string, data: Partial<BaseUser>) => Promise<BaseUser | null>;
  deleteUser: (id: string) => Promise<boolean>;
  updateUserStatus: (id: string, status: UserStatus) => Promise<void>;
  filterByRole: (users: BaseUser[], role: UserRole) => BaseUser[];
  
  // Trainers Management
  approveTrainer: (id: string, approvedBy: string) => Promise<void>;
  rejectTrainer: (id: string, rejectionReason: string) => Promise<void>;
  deleteTrainer: (id: string) => Promise<void>;
  
  // Payments Management
  getPaymentDetails: (id: string) => Promise<AdminPayment | null>;
  filterPaymentsByStatus: (payments: AdminPayment[], status: string) => AdminPayment[];
  filterPaymentsByField: (payments: AdminPayment[], fieldId: string) => AdminPayment[];
  
  // Feedback Management
  updateTicketStatus: (id: string, status: FeedbackTicket['status']) => Promise<void>;
  addAdminResponse: (id: string, response: string) => Promise<void>;
  
  // Analytics
  getAnalytics: () => Promise<AdminAnalytics | null>;
  
  // Roadmaps Management
  getRoadmaps: () => Promise<Roadmap[] | null>;
  getPendingRoadmaps: () => Promise<Roadmap[] | null>;
  approveRoadmap: (id: string, approvedBy: string) => Promise<void>;
  rejectRoadmap: (id: string, rejectionReason: string) => Promise<void>;
}

export function useAdmin(): UseAdminReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Users Management
  const createUser = async (data: CreateUserData): Promise<BaseUser | null> => {
    try {
      setIsLoading(true);
      const res = await apiClient.post<{ data: BaseUser }>(API_ENDPOINTS.USERS, data);
      setError(null);
      return res.data?.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, data: Partial<BaseUser>): Promise<BaseUser | null> => {
    try {
      setIsLoading(true);
      const res = await apiClient.put<{ data: BaseUser }>(API_ENDPOINTS.USER_BY_ID(id), data);
      setError(null);
      return res.data?.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await apiClient.delete(API_ENDPOINTS.USER_BY_ID(id));
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (id: string, status: UserStatus): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.put(API_ENDPOINTS.USER_STATUS(id), { status });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const filterByRole = (users: BaseUser[], role: UserRole): BaseUser[] => {
    return users.filter((u) => u.role === role);
  };

  // Trainers Management
  const approveTrainer = async (id: string, approvedBy: string): Promise<void> => {
    try {
      setIsLoading(true);
      await adminService.approveTrainer(id, approvedBy);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const rejectTrainer = async (id: string, rejectionReason: string): Promise<void> => {
    try {
      setIsLoading(true);
      await adminService.rejectTrainer(id, rejectionReason);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrainer = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.delete(API_ENDPOINTS.USER_BY_ID(id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Payments Management
  const getPaymentDetails = async (id: string): Promise<AdminPayment | null> => {
    try {
      setIsLoading(true);
      // Load payment details from the admin payments API
      const paymentsRes = await adminService.getPayments();
      const payment = paymentsRes.data?.find(p => p._id === id);
      setError(null);
      return payment ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const filterPaymentsByStatus = (payments: AdminPayment[], status: string): AdminPayment[] => {
    return payments.filter((p) => p.status === status);
  };

  const filterPaymentsByField = (payments: AdminPayment[], fieldId: string): AdminPayment[] => {
    return payments.filter((p) => p.userId === fieldId);
  };

  // Feedback Management
  const updateTicketStatus = async (id: string, status: FeedbackTicket['status']): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.patch(API_ENDPOINTS.ADMIN_FEEDBACK_BY_ID(id), { status });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const addAdminResponse = async (id: string, response: string): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.post(API_ENDPOINTS.ADMIN_FEEDBACK_RESPONSE(id), { response });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics
  const getAnalytics = async (): Promise<AdminAnalytics | null> => {
    try {
      setIsLoading(true);
      const res = await adminService.getAnalytics();
      setError(null);
      return res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Roadmaps Management
  const getRoadmaps = async (): Promise<Roadmap[] | null> => {
    try {
      setIsLoading(true);
      const res = await adminService.getRoadmaps();
      setError(null);
      return res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPendingRoadmaps = async (): Promise<Roadmap[] | null> => {
    try {
      setIsLoading(true);
      const res = await adminService.getPendingRoadmaps();
      setError(null);
      return res.data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const approveRoadmap = async (id: string, approvedBy: string): Promise<void> => {
    try {
      setIsLoading(true);
      await adminService.approveRoadmap(id, approvedBy);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const rejectRoadmap = async (id: string, rejectionReason: string): Promise<void> => {
    try {
      setIsLoading(true);
      await adminService.rejectRoadmap(id, rejectionReason);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    filterByRole,
    approveTrainer,
    rejectTrainer,
    deleteTrainer,
    getPaymentDetails,
    filterPaymentsByStatus,
    filterPaymentsByField,
    updateTicketStatus,
    addAdminResponse,
    getAnalytics,
    getRoadmaps,
    getPendingRoadmaps,
    approveRoadmap,
    rejectRoadmap,
  };
}
