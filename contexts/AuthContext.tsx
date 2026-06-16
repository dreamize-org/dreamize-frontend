'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth';
import { BaseUser, OnboardingChecklist, StudentRegister, Trainer, UserRole, Guardian, GuardianInviteState } from '@/types';
import { useRouter } from '@/hooks/useRouter';
import { userService } from '@/services';

const DASHBOARD_ROUTES: Record<string, string> = {
  student: '/dashboard/student',
  trainer: '/dashboard/trainer',
  admin: '/dashboard/admin',
  guardian: '/dashboard/guardian',
  sales_manager: '/dashboard/sales',
};

function getDashboardRoute(role: string): string {
  return DASHBOARD_ROUTES[role] || '/';
}

function canAccessDashboard(user: BaseUser): boolean {
  if (!user.isVerified) return false;
  if (user.role === UserRole.TRAINER && (user as Trainer).approvalStatus === 'pending') {
    return false;
  }
  if (user.role === UserRole.GUARDIAN && (user as Guardian).inviteState === GuardianInviteState.INVITED) {
    return false;
  }
  return true;
}

function getPostAuthRoute(user: BaseUser): string {
  if (!user.isVerified) return '/auth/verify';
  if (user.role === UserRole.TRAINER && (user as Trainer).approvalStatus === 'pending') {
    return '/auth/pending-approval';
  }
  if (user.role === UserRole.GUARDIAN && (user as Guardian).inviteState === GuardianInviteState.INVITED) {
    return '/auth/login';
  }
  return getDashboardRoute(user.role);
}

interface AuthContextType {
  error: string | null;
  user: BaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerStudent: (data: Partial<StudentRegister>) => Promise<void>;
  registerTrainer: (data: Partial<Trainer>) => Promise<void>;
  logout: () => void;
  onboardingChecklist: OnboardingChecklist;
  handleDashboardRedirect: () => void;
  fetchOnboardingChecklist: () => Promise<void>;
  updateUserProfile: (userData: Partial<BaseUser>) => Promise<void>;
  verifyOtp: (email: string, otpValue: string) => Promise<boolean>;
  clearError: () => void;
  syncSessionUser: () => Promise<BaseUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const clearError = useCallback(() => setError(null), []);

  const persistSession = useCallback((userData: BaseUser, token?: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userEmail', userData.email);
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    setUser(userData);
  }, []);

  const syncSessionUser = useCallback(async (): Promise<BaseUser | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const response = await userService.getMe();
      if (response.success && response.data) {
        persistSession(response.data);
        return response.data;
      }
    } catch {
      // Fall back to stored user below
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as BaseUser;
      setUser(parsedUser);
      return parsedUser;
    }

    return null;
  }, [persistSession]);

  const handleDashboardRedirect = useCallback(() => {
    if (!user || !canAccessDashboard(user)) return;
    router.push(getDashboardRoute(user.role));
  }, [router, user]);

  const redirectAfterAuth = useCallback((userData: BaseUser) => {
    router.push(getPostAuthRoute(userData));
  }, [router]);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      const sessionUser = await syncSessionUser();
      if (!sessionUser) {
        setIsLoading(false);
        return;
      }

      if (!sessionUser.isVerified) {
        setIsLoading(false);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/verify')) {
          router.push('/auth/verify');
        }
        return;
      }

      if (sessionUser.role === UserRole.TRAINER) {
        const trainer = sessionUser as Trainer;
        if (trainer.approvalStatus === 'pending') {
          setIsLoading(false);
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/pending-approval')) {
            router.push('/auth/pending-approval');
          }
          return;
        }
      }

      if (sessionUser.role === UserRole.GUARDIAN) {
        const guardian = sessionUser as Guardian;
        if (guardian.inviteState === GuardianInviteState.INVITED) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('userEmail');
          setUser(null);
          setIsLoading(false);
          router.push('/auth/login');
          setError('Please use the invitation email link to set up your account.');
          return;
        }
      }

      if (sessionUser.role === UserRole.STUDENT) {
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

    checkSession();
  }, [router, syncSessionUser]);

  const fetchOnboardingChecklist = async () => {
    if (user && user.role === UserRole.STUDENT) {
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
    if (user?._id) {
      fetchOnboardingChecklist();
    }
  }, [user?._id]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);

      if (response.success && response.data) {
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
        await authService.sendOtp(email);
        router.push('/auth/verify');
        setError('Your email is not verified yet. We sent a new code — check your inbox.');
        return;
      }

      if (message.includes('pending approval')) {
        router.push('/auth/pending-approval');
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
    setIsLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email address is missing. Please register again or sign in.');
      setIsLoading(false);
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
        router.push('/auth/reset-password');
        return true;
      }

      if (!response.data?.user) {
        setError('Verification succeeded but user data was missing. Please sign in again.');
        return false;
      }

      persistSession(response.data.user, response.data.token);
      redirectAfterAuth(response.data.user);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore API errors
    } finally {
      setUser(null);
      setError(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userEmail');
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
      isAuthenticated: !!user,
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
      clearError,
      syncSessionUser,
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
