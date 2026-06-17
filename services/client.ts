import { BASE_URL } from './constants';
import { ApiResponse } from '@/types';

const API_CONFIG = { BASE_URL, TIMEOUT: 60000 };
const HTTP_STATUS = { UNAUTHORIZED: 401, FORBIDDEN: 403 };

class ApiClient {
  private logoutListeners: (() => void)[] = [];

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  private getHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
    const token = this.getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  public async logout(): Promise<void> {
    try {
      localStorage.removeItem('auth_token');
    } catch { /* ignore */ } finally {
      this.logoutListeners.forEach(cb => { try { cb(); } catch { /* ignore */ } });
    }
  }

  public onLogout(callback: () => void): void {
    this.logoutListeners.push(callback);
  }

  public removeLogoutListener(callback: () => void): void {
    this.logoutListeners = this.logoutListeners.filter(cb => cb !== callback);
  }

  private async request<T>(method: string, endpoint: string, body?: unknown, timeout = API_CONFIG.TIMEOUT): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method,
        headers: this.getHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (res.status === HTTP_STATUS.UNAUTHORIZED || res.status === HTTP_STATUS.FORBIDDEN) {
        this.logoutListeners.forEach(cb => { try { cb(); } catch { /* ignore */ } });
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = (data as ApiResponse<T> | null)?.message;
        throw new Error(message || `HTTP ${res.status}`);
      }
      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<T>('GET', endpoint + query);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  async uploadFile<T>(
    endpoint: string,
    file: File,
    _onUploadProgress?: (event: { loaded: number; total?: number }) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  }

  async getWithRetry<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.get(endpoint, params);
  }

  async postWithRetry<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.post(endpoint, data);
  }

  async getCritical<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.get(endpoint, params);
  }

  async postCritical<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.post(endpoint, data);
  }
}

export const apiClient = new ApiClient();
