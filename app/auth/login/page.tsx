'use client';

import { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { useAuth } from '@/contexts';
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { PremiumInput } from '@/components/ui/premium-input';
import { Lock, LogIn, Mail } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';

export default function LoginPage() {
  const { navigate } = useNavigationWithLoading();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localErrors, setLocalErrors] = useState({ email: '', password: '' });

  useEffect(() => {
    setLocalErrors({ email: '', password: '' });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErrors({ email: '', password: '' });

    // Client-side validation
    if (!email) {
      setLocalErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    if (!password) {
      setLocalErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    await login(email, password);
  };

  return (
    <AuthContainer>
      <AuthCard
        title="Welcome Back" 
        subtitle="Sign in to your account to continue your learning journey."
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <PremiumInput
            label="Email Address"
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalErrors(prev => ({ ...prev, email: '' }));
            }}
            placeholder="jane@example.com"
            error={localErrors.email}
            icon={<Mail size={20} />}
            required
          />

          <PremiumInput
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLocalErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••"
            error={localErrors.password}
            icon={<Lock size={20} />}
            required
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-[14px] text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <PremiumButton
              type="submit" 
              isLoading={isLoading}
            >
              Sign In
              <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            </PremiumButton>
          </div>
        </form>

        <div className="mt-8 space-y-4">
          <p className="text-center text-[15px] text-slate-500 font-light">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/auth/signup')}
              className="text-primary font-bold hover:underline"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>

          <p className="text-center">
            <button
              onClick={() => navigate('/auth/forgot-password')}
              className="text-[14px] text-slate-400 hover:text-primary transition-colors font-medium"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </p>
        </div>

        <div className="mt-12 text-center text-[12px] text-slate-400 uppercase tracking-widest font-bold">
          © Dreamize 2025
        </div>
      </AuthCard>
    </AuthContainer>
  );
}

