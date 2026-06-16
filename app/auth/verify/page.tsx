'use client';

import { useState, useEffect, useRef } from 'react';
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuth } from '@/contexts';

export default function VerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, isLoading, error, clearError, syncSessionUser } = useAuth();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || '';
    setEmail(storedEmail);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkExistingVerification = async () => {
      const sessionUser = await syncSessionUser();
      if (cancelled || !sessionUser?.isVerified) return;

      if (sessionUser.role === 'trainer' && (sessionUser as { approvalStatus?: string }).approvalStatus === 'pending') {
        window.location.href = '/auth/pending-approval';
        return;
      }

      const dashboardRoutes: Record<string, string> = {
        student: '/dashboard/student',
        trainer: '/dashboard/trainer',
        admin: '/dashboard/admin',
        guardian: '/dashboard/guardian',
        sales_manager: '/dashboard/sales',
      };
      window.location.href = dashboardRoutes[sessionUser.role] || '/dashboard/student';
    };

    checkExistingVerification();
    return () => {
      cancelled = true;
    };
  }, [syncSessionUser]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    clearError();
    setFormError(null);
    setResendMessage(null);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    clearError();
    setFormError(null);
    setResendMessage(null);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);
    setResendMessage(null);

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setFormError('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      setFormError('Email address is missing. Please register or sign in again.');
      return;
    }

    const success = await verifyOtp(email, otpValue);
    if (!success) {
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    clearError();
    setFormError(null);
    setResendMessage(null);

    if (!email) {
      setResendMessage('Email address is missing. Please register or sign in again.');
      return;
    }

    try {
      await authService.resendOtp(email);
      setResendMessage('A new verification code was sent. Check your inbox and spam folder.');
      setTimer(120);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setResendMessage('Could not resend the code. Please try again in a moment.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayError = error || formError;

  return (
    <AuthContainer>
      <AuthCard
        title="Verify Email"
        subtitle="We've sent a 6-digit code to your inbox. Enter it below to proceed."
      >
        <button
          type="button"
          onClick={() => window.history.back()}
          className="absolute top-5 left-5 sm:top-8 sm:left-8 p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl text-primary mb-4">
            <ShieldCheck size={32} />
          </div>
          <p className="text-[14px] text-slate-400 font-medium tracking-tight">
            ({email || 'your email'})
          </p>
        </div>

        <form onSubmit={handleContinue} className="space-y-8">
          <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className={`
                  w-10 h-12 sm:w-11 sm:h-14 md:w-14 md:h-16 text-center text-lg sm:text-xl font-bold border rounded-xl 
                  focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary 
                  transition-all bg-slate-50 text-slate-900 disabled:opacity-60
                  ${displayError ? 'border-red-500 ring-red-500/10' : 'border-slate-200'}
                `}
              />
            ))}
          </div>

          {displayError && (
            <p className="text-[14px] text-red-500 text-center font-medium">
              {displayError}
            </p>
          )}

          {resendMessage && (
            <p className={`text-[14px] text-center font-medium ${resendMessage.includes('Could not') ? 'text-red-500' : 'text-green-600'}`}>
              {resendMessage}
            </p>
          )}

          {!email && (
            <p className="text-[14px] text-amber-600 text-center font-medium">
              We could not find your email for verification. Please sign in or register again.
            </p>
          )}

          <div className="text-center">
            <span className="text-[15px] text-slate-500 font-light">Didn&apos;t receive code? </span>
            {timer > 0 ? (
              <span className="text-[15px] text-primary font-bold">
                Resend in {formatTime(timer)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-[15px] text-primary font-bold hover:underline disabled:opacity-50"
              >
                Resend Now
              </button>
            )}
          </div>

          <PremiumButton
            type="submit"
            isLoading={isLoading}
            disabled={!email || isLoading}
          >
            Verify & Continue
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </PremiumButton>
        </form>

        <div className="mt-8 text-center text-[15px] text-slate-500 font-light">
          Have an account?{' '}
          <a href="/auth/login" className="text-primary font-bold hover:underline">
            Sign In
          </a>
        </div>

        <div className="mt-12 text-center text-[12px] text-slate-400 uppercase tracking-widest font-bold">
          © Dreamize 2025
        </div>
      </AuthCard>
    </AuthContainer>
  );
}
