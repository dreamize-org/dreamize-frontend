import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import type { ApiResponse } from '@/types';
import { LeadStatus } from '@/types/dashboard';

export interface SalesLeadRecord {
  _id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  signupDate: string;
  status: LeadStatus;
  lastContactedAt: string | null;
  notes: string;
  updatedAt?: string;
}

export interface SalesDashboardData {
  totalFreeSignups: number;
  conversionRate: number;
  leads: SalesLeadRecord[];
}

class SalesService {
  async getDashboard(): Promise<ApiResponse<SalesDashboardData>> {
    return apiClient.get<SalesDashboardData>(API_ENDPOINTS.SALES_DASHBOARD);
  }

  async getLeads(params?: { status?: LeadStatus; search?: string }): Promise<ApiResponse<SalesLeadRecord[]>> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<SalesLeadRecord[]>(`${API_ENDPOINTS.SALES_LEADS}${suffix}`);
  }

  async updateLead(
    leadId: string,
    payload: { status?: LeadStatus; notes?: string; markContacted?: boolean }
  ): Promise<ApiResponse<SalesLeadRecord>> {
    return apiClient.patch<SalesLeadRecord>(API_ENDPOINTS.SALES_LEAD_BY_ID(leadId), payload);
  }
}

export const salesService = new SalesService();
