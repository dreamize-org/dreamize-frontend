'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts';
import { getPostAuthRoute } from '@/lib/auth/routes';
import { useRouter } from '@/hooks/useRouter';

function resolveVerificationEmail(sessionEmail?: string): string {
  if (sessionEmail) return sessionEmail;
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('userEmail')?.trim().toLowerCase() || '';
}

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    user,
    authStatus,
    isLoading,
    error,
    verifyOtp,
    resendVerificationOtp,
    clearError,
  } = useAuth();

  const isResetFlow =
    typeof window !== 'undefined' && localStorage.getItem('authFlow') === 'reset-password';

  const email = useMemo(
    () => resolveVerificationEmail(user?.email),
    [user?.email]
  );

  useEffect(() => {
    clearError();
    setFormError(null);
    setResendMessage(null);
  }, [clearError]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoading || authStatus !== 'ready' || !user) return;
    router.push(getPostAuthRoute(user));
  }, [authStatus, isLoading, router, user]);

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
      setFormError('We could not determine your email. Please sign in or register again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await verifyOtp(email, otpValue);
      if (!success) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    clearError();
    setFormError(null);
    setResendMessage(null);

    if (!email) {
      setFormError('We could not determine your email. Please sign in or register again.');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerificationOtp(email);
      if (!result.success) {
        setFormError(result.message || 'Could not resend the code.');
        return;
      }
      setResendMessage(result.message || 'A new verification code was sent.');
      setTimer(120);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayError = error || formError;
  const pageBusy = isSubmitting || isResending;

  if (isLoading || authStatus === 'loading') {
    return (
      <AuthContainer>
        <div className="flex flex-col items-center justify-center p-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-sm text-slate-500">Loading your verification session...</p>
        </div>
      </AuthContainer>
    );
  }

  if (authStatus === 'ready') {
    return (
      <AuthContainer>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-sm text-slate-600">Your email is already verified. Redirecting...</p>
        </div>
      </AuthContainer>
    );
  }

  if (authStatus === 'guest' && !email) {
    return (
      <AuthContainer>
        <AuthCard
          title="Verification Required"
          subtitle="Start from login or registration so we know which account to verify."
        >
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600">
              This page needs an active signup or password-reset request before we can send a code.
            </p>
            <PremiumButton type="button" onClick={() => router.push('/auth/login')}>
              Go to Sign In
            </PremiumButton>
          </div>
        </AuthCard>
      </AuthContainer>
    );
  }

  const title = isResetFlow ? 'Verify Reset Code' : 'Verify Email';
  const subtitle = isResetFlow
    ? 'Enter the 6-digit code we sent to reset your password.'
    : 'Enter the 6-digit code sent to your email to continue.';

  return (
    <AuthContainer>
      <AuthCard title={title} subtitle={subtitle}>
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-5 left-5 sm:top-8 sm:left-8 p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl text-primary mb-4">
            <ShieldCheck size={32} />
          </div>
          <p className="text-[14px] text-slate-400 font-medium tracking-tight break-all">
            {email}
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
                disabled={pageBusy}
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
            <p className="text-[14px] text-center font-medium text-green-600">
              {resendMessage}
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
                disabled={pageBusy || !email}
                className="text-[15px] text-primary font-bold hover:underline disabled:opacity-50"
              >
                Resend Now
              </button>
            )}
          </div>

          <PremiumButton
            type="submit"
            isLoading={isSubmitting}
            disabled={!email || pageBusy}
          >
            {isResetFlow ? 'Verify Code' : 'Verify & Continue'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </PremiumButton>
        </form>

        <div className="mt-8 text-center text-[15px] text-slate-500 font-light">
          Have an account?{' '}
          <Link href="/auth/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </div>

        <div className="mt-12 text-center text-[12px] text-slate-400 uppercase tracking-widest font-bold">
          © Dreamize 2025
        </div>
      </AuthCard>
    </AuthContainer>
  );
}
