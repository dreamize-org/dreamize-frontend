'use client';

import { AdminProvider } from '@/contexts';
import DashboardAuthGuard from '@/components/auth/DashboardAuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <DashboardAuthGuard>{children}</DashboardAuthGuard>
    </AdminProvider>
  );
}
