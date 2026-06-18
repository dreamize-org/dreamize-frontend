'use client';

import { AdminFooter, AdminHeader, AdminMain, AdminShell } from '@/components/admin/AdminLayout';
import ChatInterface from '@/components/chat/ChatInterface';
import { UserRole } from '@/types';
import { ShieldCheck } from 'lucide-react';

export default function AdminChatPage() {
  return (
    <AdminShell activeItem="chat">
      <AdminHeader
        badge="Communications"
        subtitle="Encrypted Channel"
        title="Unified Messaging"
        actions={
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">
              End-to-End Encrypted
            </span>
          </div>
        }
      />

      <AdminMain>
        <div className="h-[calc(100vh-220px)] min-h-[480px] flex flex-col">
          <div className="flex-1 bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <ChatInterface userType={UserRole.ADMIN} />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Server Status: Online
              </span>
            </div>
          </div>
        </div>

        <AdminFooter label="© Dreamize Africa 2025 • Communications Protocol" />
      </AdminMain>
    </AdminShell>
  );
}
