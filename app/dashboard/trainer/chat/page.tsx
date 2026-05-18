'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types/user';
import ChatInterface from '@/components/chat/ChatInterface';

export default function TrainerChatPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar activeItem="Chat" userType={UserRole.TRAINER} />

            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 overflow-hidden bg-gray-50/30">
                    <ChatInterface userType="trainer" />
                </main>
            </div>
        </div>
    );
}
