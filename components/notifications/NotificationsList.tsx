'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { notificationService } from '@/services';
import type { Notification } from '@/services/notification';
import { notifyNotificationSync } from '@/hooks/useNotificationUnreadCount';
import { useNavigationWithLoading } from '@/lib/utils/navigation';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const { navigate } = useNavigationWithLoading();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data ?? []);
      }
    } catch {
      setError('Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
        notifyNotificationSync();
      } catch {
        // ignore
      }
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      notifyNotificationSync();
    } catch {
      setError('Could not mark all as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-playfair font-semibold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-full hover:bg-slate-800 disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="p-8 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No notifications yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Updates about bookings, projects, and certificates will appear here.
          </p>
        </div>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <div className="divide-y divide-slate-100">
          {notifications.map((notification) => (
            <button
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full text-left flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors ${
                !notification.isRead ? 'bg-primary/[0.03]' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                {!notification.isRead && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                <p className="text-xs text-slate-400 mt-2">{formatTime(notification.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
