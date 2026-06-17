'use client';

import { useRedirectIfAuthenticated } from '@/hooks/useRequireAuth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRedirectIfAuthenticated();
  return children;
}
