'use client';

import { useEffect } from 'react';
import { useRouter } from '@/hooks/useRouter';

export default function LegacyProjectCreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/student/roadmap/create');
  }, [router]);

  return null;
}
