import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import type { ApiResponse } from '@/types';

export interface WeeklySlot {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface TrainerAvailability {
  trainerId: string;
  timezone: string;
  weeklySchedule: WeeklySlot[];
  slotDurationMinutes: number;
  blockedDates: { date: string; reason: string }[];
}

export interface AvailabilitySlot {
  startTime: string;
  isoTime: string;
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export { DAY_LABELS };

class AvailabilityService {
  async getMyAvailability(): Promise<ApiResponse<TrainerAvailability>> {
    return apiClient.get<TrainerAvailability>(API_ENDPOINTS.TRAINER_MY_AVAILABILITY);
  }

  async updateMyAvailability(data: Partial<TrainerAvailability>): Promise<ApiResponse<TrainerAvailability>> {
    return apiClient.put<TrainerAvailability>(API_ENDPOINTS.TRAINER_MY_AVAILABILITY, data);
  }

  async getTrainerSlots(trainerId: string, date: string): Promise<ApiResponse<AvailabilitySlot[]>> {
    return apiClient.get<AvailabilitySlot[]>(
      `${API_ENDPOINTS.TRAINER_SLOTS(trainerId)}?date=${encodeURIComponent(date)}`
    );
  }
}

export const availabilityService = new AvailabilityService();
