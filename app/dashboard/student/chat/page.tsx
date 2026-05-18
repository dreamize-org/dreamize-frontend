'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import Sidebar from '@/components/dashboard/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { UserRole } from '@/types';

function ChatPageContent() {
    const searchParams = useSearchParams();
    const roadmap = searchParams.get('roadmap');

    return (
        <>
            {roadmap && (
                <div className="fixed right-0 w-fit z-50 p-4 bg-transparent">
                    <Link href="/post-signup/roadmap">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 shadow-md">
                            Return to Roadmap Creation
                        </button>
                    </Link>
                </div>
            )}
            <ChatInterface userType={UserRole.STUDENT} />
        </>
    );
}

export default function StudentChatPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#FDF9F2]">
            <Sidebar activeItem="Chat" userType={UserRole.STUDENT} />

            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 overflow-hidden relative">
                    <Suspense fallback={<ChatInterface userType={UserRole.STUDENT} />}>
                        <ChatPageContent />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
