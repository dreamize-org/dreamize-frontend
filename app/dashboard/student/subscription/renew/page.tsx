'use client';

import { useEffect } from 'react';
import { useRouter } from '@/hooks/useRouter';

export default function RenewSubscriptionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/student/subscription');
  }, [router]);

  return null;
}
