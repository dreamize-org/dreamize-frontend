'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { notificationService, socketService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { getTokenUserId } from '@/lib/auth/session';

export const NOTIFICATION_SYNC_EVENT = 'dreamize:notification-sync';

const NOTIFICATION_ROLES = new Set(['student', 'trainer', 'admin']);

export function notifyNotificationSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATION_SYNC_EVENT));
  }
}

export function useNotificationUnreadCount() {
  const { user, authStatus } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (authStatus !== 'ready' || !getTokenUserId() || !user || !NOTIFICATION_ROLES.has(user.role)) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch {
      // Non-critical — keep last known count
    }
  }, [authStatus, user]);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    const onSync = () => refresh();
    window.addEventListener(NOTIFICATION_SYNC_EVENT, onSync);
    return () => window.removeEventListener(NOTIFICATION_SYNC_EVENT, onSync);
  }, [refresh]);

  useEffect(() => {
    if (authStatus !== 'ready' || !user || !NOTIFICATION_ROLES.has(user.role)) {
      return;
    }

    const handleIncoming = () => {
      if (!pathname.includes('/notifications')) {
        refresh();
      }
    };

    socketService.connect().catch(() => undefined);
    socketService.onNotification(handleIncoming);

    const interval = setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);

    return () => {
      socketService.removeNotificationListener(handleIncoming);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [authStatus, pathname, refresh, user]);

  return { unreadCount, refreshUnreadCount: refresh };
}
