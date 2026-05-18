'use client';

import { useState } from 'react';
import { useRouter } from '@/hooks/useRouter';;
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await authService.forgotPassword(email);
      // Store email and flow type for the OTP + reset flow
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authFlow', 'reset-password');
      router.push('/auth/verify');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard 
        title="Forgot Password?" 
        subtitle="Don't worry! Enter your email below and we'll send you instructions to reset it."
      >
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-5 sm:top-8 sm:left-8 p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <form onSubmit={handleContinue} className="space-y-6 mt-4">
          <PremiumInput
            label="Email Address"
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="jane@example.com"
            error={error}
            icon={<Mail size={20} />}
            required
          />

          <PremiumButton 
            type="submit" 
            isLoading={isLoading}
          >
            Continue
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </PremiumButton>
        </form>

        <div className="mt-8 text-center text-[15px] text-slate-500 font-light">
          Remember password?{' '}
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

