import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import type { ApiResponse } from '@/types';

export interface Transaction {
  id: string;
  walletId: string;
  type: 'payment' | 'withdrawal' | 'refund' | 'transfer';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  date: string;
  reference?: string;
}

export interface Wallet {
  id: string;
  ownerId: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  student?: string;
  type: 'orientation' | 'subscription';
  amount: number;
  finalAmount?: number;
  status: 'pending' | 'success' | 'failed';
  transactionRef: string;
  paidAt: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  planName: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
}

class FinancialService {
  async getMyPayments(): Promise<ApiResponse<Payment[]>> {
    return apiClient.get<Payment[]>(API_ENDPOINTS.PAYMENT_HISTORY);
  }

  async getSubscriptionStatus(): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.get<Record<string, unknown>>(API_ENDPOINTS.PAYMENT_SUBSCRIPTION_STATUS);
  }
}

export const financialService = new FinancialService();
