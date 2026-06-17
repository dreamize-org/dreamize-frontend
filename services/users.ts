import { Student, BaseUser, Trainer, ProfileUpdate } from '@/types';
import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import { ApiResponse } from '@/types/api';

class UserService {
  async getStudent(): Promise<ApiResponse<Student>> {
    return apiClient.get<Student>(API_ENDPOINTS.USERS_ME);
  }

  async getMe(): Promise<ApiResponse<BaseUser>> {
    return apiClient.get<BaseUser>(API_ENDPOINTS.USERS_ME);
  }

  async getTrainer(): Promise<ApiResponse<Trainer>> {
    return apiClient.get<Trainer>(API_ENDPOINTS.USERS_ME);
  }

  async updateProfile(data: ProfileUpdate): Promise<ApiResponse<BaseUser>> {
    return apiClient.put<BaseUser>(API_ENDPOINTS.USER_PROFILE, data);
  }

  async getUsers(): Promise<ApiResponse<BaseUser[]>> {
    return apiClient.get<BaseUser[]>(API_ENDPOINTS.USERS);
  }

  async getTrainers(): Promise<ApiResponse<Trainer[]>> {
    return apiClient.get<Trainer[]>(API_ENDPOINTS.USERS_TRAINERS);
  }
  
  async getStudents(): Promise<ApiResponse<Student[]>> {
    return apiClient.get<Student[]>(API_ENDPOINTS.USERS_STUDENTS);
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<BaseUser>> {
    return apiClient.put<BaseUser>(API_ENDPOINTS.USER_STATUS(id), { status });
  }

  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    return apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.FILES.UPLOAD_AVATAR, file);
  }
}

export const userService = new UserService();
