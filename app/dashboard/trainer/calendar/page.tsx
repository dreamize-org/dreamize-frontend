'use client';

import { useEffect } from 'react';
import { useRouter } from '@/hooks/useRouter';

export default function TrainerCalendarRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/trainer/availability');
  }, [router]);

  return null;
}
