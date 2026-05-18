'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types';
import ChatInterface from '@/components/chat/ChatInterface';
import { ShieldCheck } from 'lucide-react';

export default function AdminChatPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            <Sidebar activeItem="Chat" userType={UserRole.ADMIN} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 pl-16 pr-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Internal Communications</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[12px] font-medium text-slate-400 italic">Encrypted Channel</span>
                      </div>
                      <h1 className="text-2xl font-bold text-slate-900">Unified Messaging</h1>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          <span className="text-[11px] font-bold text-white uppercase tracking-widest">End-to-End Encrypted</span>
                       </div>
                    </div>
                  </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-hidden">
                    <div className="max-w-7xl mx-auto h-full flex flex-col">
                        <ChatInterface userType={UserRole.ADMIN} />
                        
                        <div className="mt-6 flex items-center justify-between px-2">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Server Status: Online</span>
                           </div>
                           <p className="text-slate-300 text-[10px] font-black tracking-[0.3em] uppercase italic">© Dreamize Africa 2025 • Communications Protocol</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
