import { AuthResponse } from '@/types/auth';
import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import { ApiResponse, OnboardingChecklist, StudentRegister, Trainer } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}


class AuthService {
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, { email, password });
    return response;
  }

  async registerStudent(data: Partial<StudentRegister>): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER_STUDENT, data);
    return response;
  }

  async registerTrainer(data: Partial<Trainer>): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER_TRAINER, data);
    return response;
  }

  async sendOtp(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH_SEND_OTP, { email });
  }

  async verifyOtp(email: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH_VERIFY_OTP, { email, otp });
    return response;
  }

  async resendOtp(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH_RESEND_OTP, { email });
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
  }

  async resetPassword(newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { newPassword });
  }


  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
    } catch {
      // ignore
    } finally {
      localStorage.clear()
    }
  }

  async getOnboardingChecklist(): Promise<ApiResponse<OnboardingChecklist>> {
    return apiClient.get<OnboardingChecklist>(API_ENDPOINTS.AUTH_ONBOARDING_CHECKLIST);
  }

}

export const authService = new AuthService();
