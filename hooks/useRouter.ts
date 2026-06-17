'use client';

import { useRouter as useNextRouter } from 'next/navigation';
import { useRouter as useProgressBarRouter } from 'next-app-progress-bar';

export function useRouter() {
  const nextRouter = useNextRouter();
  const progressRouter = useProgressBarRouter();

  if (typeof window === 'undefined') {
    return nextRouter;
  }

  return progressRouter;
}
