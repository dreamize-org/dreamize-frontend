import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import type { ApiResponse } from '@/types';

export type NotificationCategory =
  | 'booking'
  | 'project'
  | 'certificate'
  | 'roadmap'
  | 'system';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  relatedEntityId: string | null;
  createdAt: string;
  updatedAt?: string;
}

class NotificationService {
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS);
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
  }

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.patch<Notification>(API_ENDPOINTS.NOTIFICATION_READ(id));
  }

  async markAllAsRead(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.patch<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS_READ_ALL);
  }
}

export const notificationService = new NotificationService();
