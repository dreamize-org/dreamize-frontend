import { useCallback } from 'react';
import { useRouter } from '@/hooks/useRouter';

export function useNavigationWithLoading() {
  const router = useRouter();

  const navigate = useCallback((href: string) => {
    // Trigger loading bar immediately
    if (typeof window !== 'undefined' && window.startNavigation) {
      window.startNavigation();
    }

    router.push(href);
  }, [router]);

  return { navigate };
}

// Global function to trigger loading bar for any navigation
export const triggerLoadingBar = () => {
  if (typeof window !== 'undefined' && window.startNavigation) {
    window.startNavigation();
  }
};