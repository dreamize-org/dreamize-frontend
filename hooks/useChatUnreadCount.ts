'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { messageService, socketService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { getTokenUserId } from '@/lib/auth/session';

export const CHAT_UNREAD_SYNC_EVENT = 'dreamize:chat-unread-sync';

const CHAT_ENABLED_ROLES = new Set(['student', 'trainer', 'admin']);

export function notifyChatUnreadSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHAT_UNREAD_SYNC_EVENT));
  }
}

export function useChatUnreadCount() {
  const { user, authStatus } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (authStatus !== 'ready' || !getTokenUserId() || !user || !CHAT_ENABLED_ROLES.has(user.role)) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await messageService.getUnreadCount();
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
    const onSync = () => {
      refresh();
    };

    window.addEventListener(CHAT_UNREAD_SYNC_EVENT, onSync);
    return () => window.removeEventListener(CHAT_UNREAD_SYNC_EVENT, onSync);
  }, [refresh]);

  useEffect(() => {
    if (authStatus !== 'ready' || !user || !CHAT_ENABLED_ROLES.has(user.role)) {
      return;
    }

    const handleIncoming = () => {
      if (!pathname.includes('/chat')) {
        refresh();
      }
    };

    socketService.connect().catch(() => undefined);
    socketService.onMessage(handleIncoming);

    const interval = setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);

    return () => {
      socketService.removeMessageListener(handleIncoming);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [authStatus, pathname, refresh, user]);

  return { unreadCount, refreshUnreadCount: refresh };
}
