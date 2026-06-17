import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import { ApiResponse } from '@/types/api';

export interface StudentStats {
  activeRoadmaps: number;
  roadmapProgress: number;
  totalMilestones?: number;
  completedMilestones?: number;
}

export interface TrainerStats {
  assignedStudents: number;
  pendingBookings?: number;
  upcomingSessions?: number;
}

export interface AdminStats {
  totalUsersByRole: Record<string, number>;
  totalRevenue: number;
  activeRoadmaps: number;
}

export type StatsResponse = StudentStats | TrainerStats | AdminStats;

class StatsService {
  async getMyStats(): Promise<ApiResponse<StatsResponse>> {
    return apiClient.get<StatsResponse>(API_ENDPOINTS.STATS_ME);
  }
}

export const statsService = new StatsService();
