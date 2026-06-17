'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '@/services/auth';
import { apiClient } from '@/services/client';
import { BaseUser, OnboardingChecklist, StudentRegister, Trainer, UserRole, Guardian, GuardianInviteState } from '@/types';
import { useRouter } from '@/hooks/useRouter';
import { userService } from '@/services';
import {
  AuthStatus,
  canAccessDashboard,
  getDashboardRoute,
  getPostAuthRoute,
} from '@/lib/auth/routes';

interface AuthContextType {
  error: string | null;
  user: BaseUser | null;
  /** True when user has a session (may still need verification). */
  isAuthenticated: boolean;
  /** True only when user can access their dashboard. */
  isSessionReady: boolean;
  authStatus: AuthStatus;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerStudent: (data: Partial<StudentRegister>) => Promise<void>;
  registerTrainer: (data: Partial<Trainer>) => Promise<void>;
  logout: () => Promise<void>;
  onboardingChecklist: OnboardingChecklist;
  handleDashboardRedirect: () => void;
  fetchOnboardingChecklist: () => Promise<void>;
  updateUserProfile: (userData: Partial<BaseUser>) => Promise<void>;
  verifyOtp: (email: string, otpValue: string) => Promise<boolean>;
  resendVerificationOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
  syncSessionUser: () => Promise<BaseUser | null>;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REGISTRATION_DRAFT_KEYS = [
  'userType',
  'userFirstName',
  'userLastName',
  'userEmail',
  'userPassword',
  'userPhoneNumber',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [onboardingChecklist, setOnboardingChecklist] = useState<OnboardingChecklist>({
    accountCreated: false,
    bookingPayed: false,
    subscriptionPayed: false,
    orientationBooked: false,
    roadmapReceived: false,
    learningStarted: false,
  });

  const authStatus: AuthStatus = useMemo(
    () => {
      if (isLoading) return 'loading';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token || !user) return 'guest';
      if (!user.isVerified) return 'verify';
      if (user.role === UserRole.TRAINER && (user as Trainer).approvalStatus === 'pending') {
        return 'pending';
      }
      if (user.role === UserRole.GUARDIAN && (user as Guardian).inviteState === GuardianInviteState.INVITED) {
        return 'guest';
      }
      return 'ready';
    },
    [isLoading, user]
  );

  const clearError = useCallback(() => setError(null), []);

  const clearSession = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authFlow');
    localStorage.removeItem('resetToken');
  }, []);

  const persistSession = useCallback((userData: BaseUser, token?: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userEmail', userData.email);
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    setUser(userData);
  }, []);

  const clearRegistrationDraft = useCallback(() => {
    REGISTRATION_DRAFT_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  const syncSessionUser = useCallback(async (): Promise<BaseUser | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await userService.getMe();
      if (response.success && response.data) {
        persistSession(response.data);
        return response.data;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('401') || message.includes('403')) {
        clearSession();
        return null;
      }
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as BaseUser;
        setUser(parsedUser);
        return parsedUser;
      } catch {
        clearSession();
      }
    }

    return null;
  }, [clearSession, persistSession]);

  const handleDashboardRedirect = useCallback(() => {
    if (!user || !canAccessDashboard(user)) return;
    router.push(getDashboardRoute(user.role));
  }, [router, user]);

  const redirectAfterAuth = useCallback((userData: BaseUser) => {
    router.push(getPostAuthRoute(userData));
  }, [router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
    };

    apiClient.onLogout(handleUnauthorized);
    return () => apiClient.removeLogoutListener(handleUnauthorized);
  }, [clearSession, router]);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const sessionUser = await syncSessionUser();
      if (!sessionUser) {
        setIsLoading(false);
        return;
      }

      if (sessionUser.role === UserRole.STUDENT && sessionUser.isVerified) {
        try {
          const response = await authService.getOnboardingChecklist();
          if (response.success && response.data) {
            setOnboardingChecklist(response.data);
          }
        } catch {
          // not critical
        }
      }

      setIsLoading(false);
    };

    bootstrap();
  }, [syncSessionUser]);

  const fetchOnboardingChecklist = async () => {
    if (user && user.role === UserRole.STUDENT && user.isVerified) {
      try {
        const currentStudent = await userService.getStudent();
        if (currentStudent.success && currentStudent.data) {
          persistSession(currentStudent.data);
        }
        const response = await authService.getOnboardingChecklist();
        if (response.success && response.data) {
          setOnboardingChecklist(response.data);
        }
      } catch {
        // Silently fail - not critical
      }
    }
  };

  useEffect(() => {
    if (user?._id && user.isVerified) {
      fetchOnboardingChecklist();
    }
  }, [user?._id, user?.isVerified]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);

      if (response.success && response.data?.token && response.data.user) {
        const userData = response.data.user as BaseUser;
        persistSession(userData, response.data.token);

        if (!userData.isVerified) {
          await authService.sendOtp(email);
          router.push('/auth/verify');
          return;
        }

        redirectAfterAuth(userData);
        return;
      }

      const message = response.message || 'Login failed. Please try again.';

      if (message.includes('not verified')) {
        localStorage.setItem('userEmail', email);
        try {
          await authService.sendOtp(email);
        } catch {
          // OTP send failure should not block redirect to verify page
        }
        router.push('/auth/verify');
        setError('Your email is not verified yet. We sent a new code — check your inbox.');
        return;
      }

      if (message.includes('pending approval') && response.data?.token && response.data.user) {
        persistSession(response.data.user as BaseUser, response.data.token);
        router.push('/auth/pending-approval');
        return;
      }

      if (response.success && response.data?.user && !response.data.token) {
        setError(message);
        return;
      }

      setError(message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: Partial<StudentRegister>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.registerStudent(data);
      if (response.success && response.data) {
        persistSession(response.data.user, response.data.token);
        clearRegistrationDraft();
        router.push('/auth/verify');
        return;
      }
      setError(response.message || 'Registration failed. Please try again.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerTrainer = async (data: Partial<Trainer>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.registerTrainer(data);
      if (response.success && response.data) {
        persistSession(response.data.user, response.data.token);
        clearRegistrationDraft();
        router.push('/auth/verify');
        return;
      }
      setError(response.message || 'Registration failed. Please try again.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otpValue: string): Promise<boolean> => {
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email address is missing. Please register again or sign in.');
      return false;
    }

    try {
      const response = await authService.verifyOtp(normalizedEmail, otpValue);

      if (!response.success) {
        setError(response.message || 'Verification failed. Please try again.');
        return false;
      }

      const authFlow = typeof window !== 'undefined' ? localStorage.getItem('authFlow') : null;
      if (authFlow === 'reset-password') {
        if (response.data?.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        if (response.data?.user) {
          persistSession(response.data.user, response.data.token);
        }
        router.push('/auth/reset-password');
        return true;
      }

      if (!response.data?.user || !response.data.token) {
        setError('Verification succeeded but session data was missing. Please sign in again.');
        return false;
      }

      persistSession(response.data.user, response.data.token);
      redirectAfterAuth(response.data.user);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.');
      return false;
    }
  };

  const resendVerificationOtp = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, message: 'Email address is missing.' };
    }

    try {
      const response = await authService.resendOtp(normalizedEmail);
      if (!response.success) {
        return { success: false, message: response.message || 'Could not resend the code.' };
      }
      return { success: true, message: 'A new verification code was sent. Check your inbox and spam folder.' };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Could not resend the code. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore API errors
    } finally {
      clearSession();
      clearRegistrationDraft();
    }
  };

  const updateUserProfile = async (userData: Partial<BaseUser>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await userService.updateProfile(userData);
      if (response.success && response.data) {
        const updatedUser = { ...user, ...response.data };
        persistSession(updatedUser);
      }
    } catch (updateError) {
      console.error('Error updating user profile:', updateError);
      throw updateError;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: authStatus !== 'loading' && authStatus !== 'guest',
      isSessionReady: authStatus === 'ready',
      authStatus,
      isLoading,
      login,
      registerStudent,
      registerTrainer,
      logout,
      error,
      onboardingChecklist,
      handleDashboardRedirect,
      fetchOnboardingChecklist,
      updateUserProfile,
      verifyOtp,
      resendVerificationOtp,
      clearError,
      syncSessionUser,
      clearSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
