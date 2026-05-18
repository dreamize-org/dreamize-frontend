'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, MoreVertical, Search as SearchIcon, Smile, AlertCircle, MessageSquare, Circle, Shield, ChevronLeft } from 'lucide-react';
import { messageService, socketService } from '@/services';
import type { ChatMessage } from '@/services/messages';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/contexts/UserContext';
import type { BaseUser } from '@/types';

interface DisplayMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isMe: boolean;
    failed?: boolean;
}

function formatTime(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatInterface({ userType: _userType }: { userType: string }) {
    const { user } = useAuth();
    const { users, isLoading: contactsLoading } = useUsers();
    const [activeContact, setActiveContact] = useState<BaseUser | null>(null);
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const contacts = users.filter(u =>
        u._id !== user?._id &&
        (`${u.firstName} ${u.lastName}`).toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        socketService.connect();
        const handleIncoming = (data: { message: Record<string, unknown> }) => {
            console.log('Received message via socket:');
            const msg = data.message as unknown as ChatMessage;
            setActiveContact((current) => {
                if (!current) return current;
                const isFromActiveContact =
                    msg.senderId === current._id ||
                    msg.recipientId === current._id;
                if (isFromActiveContact) {
                    const newMessage = {
                        id: msg._id,
                        senderId: msg.senderId,
                        text: msg.text,
                        timestamp: formatTime(msg.createdAt),
                        isMe: msg.senderId === user?._id,
                    };
                    setMessages((prev) => {
                        const messageExists = prev.some(m => m.id === msg._id);
                        if (messageExists) return prev;
                        return [...prev, newMessage];
                    });
                }
                return current;
            });
        };
        socketService.onMessage(handleIncoming);
        return () => {
            socketService.removeMessageListener(handleIncoming);
        };
    }, [user?._id]);

    const handleSelectContact = useCallback(async (contact: BaseUser) => {
        setActiveContact(contact);
        setMessagesLoading(true);
        try {
            const res = await messageService.getMessages(contact._id);
            if (res.success && res.data) {
                setMessages(
                    res.data.map((m) => ({
                        id: m._id,
                        senderId: m.senderId,
                        text: m.text,
                        timestamp: formatTime(m.createdAt),
                        isMe: m.senderId === user?._id,
                    }))
                );
            }
        } catch {
            setMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    }, [user?._id]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !activeContact) return;

        const text = message.trim();
        setMessage('');
        try {
            socketService.sendMessage(activeContact._id, text);
        } catch {
            setMessage(text);
        }
    };

    return (
        <div className="flex h-full bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden md:min-h-[600px] relative">
            {/* Sidebar - Contact List */}
            <div className={`w-full md:w-96 border-r border-slate-100/80 flex flex-col bg-[#FDF9F2]/20 ${activeContact ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 md:p-8 border-b border-slate-100 pl-16 md:pl-8 bg-[#FDF9F2]/40">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-playfair font-semibold text-slate-900 tracking-tight">Messages</h2>
                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                            <MessageSquare size={18} />
                        </div>
                    </div>
                    <div className="relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100/80 rounded-2xl focus:border-primary/20 outline-none transition-all text-[13px] font-medium text-slate-700"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {contactsLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-12 h-12 rounded-full bg-slate-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                                        <div className="h-3 bg-slate-50 rounded-lg w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                            <div className="w-16 h-16 bg-white border border-slate-100 rounded-[20px] flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-base font-playfair font-semibold text-slate-800">No Messages Yet</p>
                            <p className="text-xs text-slate-400 mt-1 font-light max-w-[200px] leading-relaxed">Select a student or trainer to start chatting.</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-1">
                            {contacts.map((contact) => {
                                const displayName = `${contact.firstName} ${contact.lastName}`;
                                const isActive = activeContact?._id === contact._id;
                                return (
                                    <button
                                        key={contact._id}
                                        onClick={() => handleSelectContact(contact)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all relative group border-2 ${isActive ? 'bg-primary/10 border-primary/20 shadow-sm' : 'hover:bg-slate-50/80 border-transparent'}`}
                                    >
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-transform group-hover:scale-105 ${isActive ? 'bg-primary text-slate-900 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                                                {contact.firstName[0]}{contact.lastName[0]}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm">
                                                <Circle className="w-full h-full fill-green-500 text-green-500" />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className={`font-semibold text-[14px] truncate transition-colors ${isActive ? 'text-primary font-bold' : 'text-slate-800'}`}>{displayName}</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-medium tracking-wider px-2.5 py-0.5 rounded-full ${isActive ? 'bg-primary/20 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                                                    {contact.role}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-[#fafaf7] ${activeContact ? 'flex' : 'hidden md:flex'}`}>
                {activeContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 pl-16 md:pl-6 bg-white border-b border-slate-100/60 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setActiveContact(null)}
                                    className="p-2 -ml-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all md:hidden"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-primary font-semibold text-sm shadow-md">
                                        {activeContact.firstName[0]}{activeContact.lastName[0]}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center p-0.5">
                                        <div className="w-full h-full bg-green-500 rounded-full" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-playfair font-semibold text-slate-900 text-base tracking-tight">
                                        {activeContact.firstName} {activeContact.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Shield size={10} className="text-primary" />
                                        <span className="text-[10px] text-slate-400 font-medium tracking-wide">{activeContact.role} Profile</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-px h-6 bg-slate-100 mx-1" />
                                <button type="button" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-xl">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-[#fafaf7]">
                            {messagesLoading ? (
                                <div className="space-y-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                                            <div className="h-12 bg-white rounded-[24px] w-64 shadow-sm" />
                                        </div>
                                    ))}
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                        <Smile size={24} className="text-slate-400" />
                                    </div>
                                    <p className="text-lg font-playfair font-semibold text-slate-700">Say Hello</p>
                                    <p className="text-xs text-slate-400 mt-1 italic font-light">Start a conversation with {activeContact.firstName} {activeContact.lastName}</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`max-w-[75%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-5 py-3.5 rounded-[24px] text-sm font-normal leading-relaxed shadow-sm transition-all hover:shadow-md ${msg.isMe
                                                ? msg.failed
                                                    ? 'bg-red-50 text-red-900 border border-red-100 rounded-tr-none'
                                                    : 'bg-slate-900 text-white rounded-tr-none'
                                                : 'bg-white text-slate-700 border border-slate-100/80 rounded-tl-none'
                                                }`}>
                                                {msg.text}
                                                {msg.failed && (
                                                    <AlertCircle className="w-4 h-4 text-red-500 inline ml-2 align-middle" />
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-2 mt-1.5 px-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                                <span className="text-[10px] text-slate-400 font-light tracking-wide">
                                                    {msg.failed ? 'Failed to Sync' : msg.timestamp}
                                                </span>
                                                {!msg.failed && msg.isMe && <div className="w-1 h-1 bg-primary rounded-full" />}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 md:p-6 bg-white border-t border-slate-100/60 relative z-10">
                            <form onSubmit={handleSend} className="flex items-center gap-4 bg-[#fafaf7] p-2 rounded-[24px] border border-slate-100 focus-within:border-primary/20 focus-within:bg-white transition-all shadow-sm">
                                <button type="button" className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-white rounded-full">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-2 py-3 bg-transparent outline-none text-sm font-normal text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
                                >
                                    <Send className="w-4 h-4 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-[#fafaf7] relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(205,164,41,0.02)_0%,transparent_70%)]" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white border border-slate-100 rounded-[28px] shadow-sm flex items-center justify-center mb-6 mx-auto">
                                <MessageSquare className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-playfair font-semibold text-slate-900 mb-2">Secure Communications</h3>
                            <p className="text-slate-400 text-xs font-light max-w-sm mx-auto leading-relaxed">
                                Select a trainer or administrator from the directory to start a secure conversation.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">System: Online</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">AES-256 Secured</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
