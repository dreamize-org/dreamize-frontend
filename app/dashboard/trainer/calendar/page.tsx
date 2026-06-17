'use client';

import { useEffect } from 'react';
import { useNavigationWithLoading } from '@/lib/utils/navigation';

export default function TrainerCalendarRedirectPage() {
  const { navigate } = useNavigationWithLoading();

  useEffect(() => {
    navigate('/dashboard/trainer/availability');
  }, [navigate]);

  return null;
}
