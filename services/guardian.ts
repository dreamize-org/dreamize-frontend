import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import { Guardian, Student, ApiResponse } from '@/types';

export interface VerifyInviteRequest {
  token: string;
}

export interface VerifyInviteResponse {
  guardian?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  studentName?: string;
}

export interface SetPasswordRequest {
  token: string;
  password: string;
}

export interface GuardianLoginRequest {
  email: string;
  password: string;
}

export interface GuardianLoginResponse {
  token: string;
  guardian: Guardian;
}

export interface DeclineInviteRequest {
  token: string;
  reason?: string;
}

class GuardianService {
  async verifyInvite(token: string): Promise<ApiResponse<VerifyInviteResponse>> {
    return apiClient.post<VerifyInviteResponse>(API_ENDPOINTS.GUARDIAN_VERIFY_INVITE, { token });
  }

  async setPassword(token: string, password: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.GUARDIAN_SET_PASSWORD, { token, password });
  }

  async login(email: string, password: string): Promise<ApiResponse<GuardianLoginResponse>> {
    return apiClient.post<GuardianLoginResponse>(API_ENDPOINTS.GUARDIAN_LOGIN, { email, password });
  }

  async declineInvite(token: string, reason?: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.GUARDIAN_DECLINE_INVITE, { token, reason });
  }

  async getLinkedStudents(): Promise<ApiResponse<Student[]>> {
    return apiClient.get<Student[]>(API_ENDPOINTS.GUARDIAN_STUDENTS);
  }

  async getStudentDetails(studentId: string): Promise<ApiResponse<Student>> {
    return apiClient.get<Student>(API_ENDPOINTS.GUARDIAN_STUDENT_BY_ID(studentId));
  }

  async getStudentCertificates(studentId: string) {
    return apiClient.get(API_ENDPOINTS.GUARDIAN_STUDENT_CERTIFICATES(studentId));
  }

  async getStudentProjects(studentId: string) {
    return apiClient.get(API_ENDPOINTS.GUARDIAN_STUDENT_PROJECTS(studentId));
  }
}

export const guardianService = new GuardianService();
