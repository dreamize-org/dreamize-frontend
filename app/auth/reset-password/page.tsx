'use client';

import { useState } from 'react';
import { useRouter } from '@/hooks/useRouter';;
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';
import { Lock, Check, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { authService } from '@/services/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ password: '', confirmPassword: '', api: '' });
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ password: '', confirmPassword: '', api: '' });
    setIsLoading(true);
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      setIsLoading(false);
      return;
    }
    if (!hasMinLength || !hasSpecialChar || !hasNumber) {
      setErrors(prev => ({ ...prev, password: 'Please meet all password requirements' }));
      setIsLoading(false);
      return;
    }
    if (!confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      setIsLoading(false);
      return;
    }

    const resetToken = localStorage.getItem('resetToken') || '';

    try {
      await authService.resetPassword( password);
      localStorage.removeItem('userEmail');
      localStorage.removeItem('authFlow');
      localStorage.removeItem('resetToken');
      router.push('/auth/login');
    } catch {
      setErrors(prev => ({ ...prev, api: 'Failed to reset password. The link may have expired.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard 
        title="Reset Password" 
        subtitle="Secure your account with a new, strong password."
      >
        <button
          onClick={() => window.history.back()}
          className="absolute top-5 left-5 sm:top-8 sm:left-8 p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <form onSubmit={handleContinue} className="space-y-6 mt-4">
          <PremiumInput
            label="New Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••"
            error={errors.password}
            icon={<Lock size={20} />}
            required
          />

          <PremiumInput
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="••••••••"
            error={errors.confirmPassword}
            icon={<ShieldCheck size={20} />}
            required
          />

          {/* Password requirements */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Requirements</h4>
            {[
              { label: 'One special character', met: hasSpecialChar },
              { label: 'At least 8 characters', met: hasMinLength },
              { label: 'At least one number', met: hasNumber },
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  req.met ? 'bg-primary text-primary-foreground' : 'bg-slate-200 text-transparent'
                }`}>
                  <Check size={12} strokeWidth={4} />
                </div>
                <span className={`text-[14px] transition-colors ${req.met ? 'text-slate-800 font-medium' : 'text-slate-400 font-light'}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          {errors.api && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-[14px] text-red-600 font-medium">{errors.api}</p>
            </div>
          )}

          <PremiumButton 
            type="submit" 
            isLoading={isLoading}
          >
            Update Password
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
          </PremiumButton>
        </form>

        <div className="mt-12 text-center text-[12px] text-slate-400 uppercase tracking-widest font-bold">
          © Dreamize 2025
        </div>
      </AuthCard>
    </AuthContainer>
  );
}

