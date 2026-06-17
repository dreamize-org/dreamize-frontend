'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import NotificationsList from '@/components/notifications/NotificationsList';
import { UserRole } from '@/types';

export default function StudentNotificationsPage() {
  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Notifications" userType={UserRole.STUDENT} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-playfair font-semibold text-slate-900">Notifications</h1>
              <p className="text-slate-500 font-light mt-1">Stay updated on your learning journey</p>
            </div>
            <NotificationsList />
          </div>
        </main>
      </div>
    </div>
  );
}
