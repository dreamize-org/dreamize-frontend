'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  MoreVertical,
  Search as SearchIcon,
  Smile,
  AlertCircle,
  MessageSquare,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { messageService, socketService } from '@/services';
import type { ChatContactEntry, ChatMessage } from '@/services/messages';
import { useAuth } from '@/contexts/AuthContext';

interface DisplayMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  failed?: boolean;
}

interface ActiveContact {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

function normalizeId(id: unknown): string {
  if (!id) return '';
  return String(id);
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapMessage(message: ChatMessage, myId: string): DisplayMessage {
  return {
    id: normalizeId(message._id),
    senderId: normalizeId(message.senderId),
    text: message.text,
    timestamp: formatTime(message.createdAt),
    isMe: normalizeId(message.senderId) === normalizeId(myId),
  };
}

function contactDisplayName(contact: ActiveContact): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}

export default function ChatInterface({ userType: _userType }: { userType: string }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ChatContactEntry[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [activeContact, setActiveContact] = useState<ActiveContact | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myId = normalizeId(user?._id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const res = await messageService.getContacts();
      if (res.success && res.data) {
        setContacts(res.data);
      } else {
        setContacts([]);
      }
    } catch {
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    const onConnection = (connected: boolean) => setIsSocketConnected(connected);
    socketService.onConnectionChange(onConnection);
    socketService.connect().catch(() => setIsSocketConnected(false));

    return () => {
      socketService.removeConnectionListener(onConnection);
    };
  }, []);

  const upsertIncomingContact = useCallback(
    (msg: ChatMessage) => {
      const senderId = normalizeId(msg.senderId);
      const recipientId = normalizeId(msg.recipientId);
      const contactId = senderId === myId ? recipientId : senderId;
      const isIncoming = senderId !== myId;

      setContacts((prev) => {
        const existing = prev.find((entry) => normalizeId(entry.contact._id) === contactId);
        if (existing) {
          return prev
            .map((entry) => {
              if (normalizeId(entry.contact._id) !== contactId) return entry;
              return {
                ...entry,
                lastMessage: msg,
                lastMessageAt: msg.createdAt,
                unreadCount:
                  isIncoming && normalizeId(activeContact?._id) !== contactId
                    ? (entry.unreadCount ?? 0) + 1
                    : entry.unreadCount,
              };
            })
            .sort((a, b) => {
              if (!a.lastMessageAt) return 1;
              if (!b.lastMessageAt) return -1;
              return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
            });
        }
        return prev;
      });
    },
    [activeContact?._id, myId]
  );

  useEffect(() => {
    const handleIncoming = (data: { message: Record<string, unknown> }) => {
      const msg = data.message as unknown as ChatMessage;
      const senderId = normalizeId(msg.senderId);
      const recipientId = normalizeId(msg.recipientId);
      const contactId = senderId === myId ? recipientId : senderId;

      upsertIncomingContact(msg);

      if (normalizeId(activeContact?._id) !== contactId) return;

      setMessages((prev) => {
        const messageId = normalizeId(msg._id);
        if (prev.some((m) => m.id === messageId)) return prev;
        const withoutOptimistic = prev.filter(
          (m) => !(m.id.startsWith('temp-') && m.text === msg.text && m.isMe)
        );
        return [...withoutOptimistic, mapMessage(msg, myId)];
      });

      if (senderId !== myId) {
        messageService.markAsRead(contactId).catch(() => undefined);
        setContacts((prev) =>
          prev.map((entry) =>
            normalizeId(entry.contact._id) === contactId ? { ...entry, unreadCount: 0 } : entry
          )
        );
      }
    };

    socketService.onMessage(handleIncoming);
    return () => {
      socketService.removeMessageListener(handleIncoming);
    };
  }, [activeContact?._id, myId, upsertIncomingContact]);

  const handleSelectContact = useCallback(
    async (entry: ChatContactEntry) => {
      const contact: ActiveContact = {
        _id: normalizeId(entry.contact._id),
        firstName: entry.contact.firstName,
        lastName: entry.contact.lastName,
        role: entry.contact.role,
      };

      setActiveContact(contact);
      setMessagesLoading(true);
      setSendError('');

      try {
        const [messagesRes] = await Promise.all([
          messageService.getMessages(contact._id),
          messageService.markAsRead(contact._id).catch(() => undefined),
        ]);

        if (messagesRes.success && messagesRes.data) {
          setMessages(messagesRes.data.map((m) => mapMessage(m, myId)));
        } else {
          setMessages([]);
        }

        setContacts((prev) =>
          prev.map((item) =>
            normalizeId(item.contact._id) === contact._id ? { ...item, unreadCount: 0 } : item
          )
        );
      } catch {
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [myId]
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeContact || !user) return;

    const text = message.trim();
    setMessage('');
    setSendError('');

    const tempId = `temp-${Date.now()}`;
    const optimistic: DisplayMessage = {
      id: tempId,
      senderId: myId,
      text,
      timestamp: formatTime(new Date().toISOString()),
      isMe: true,
    };

    setMessages((prev) => [...prev, optimistic]);

    const finalizeMessage = (saved: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? mapMessage(saved, myId) : m))
      );
      setContacts((prev) =>
        prev
          .map((entry) => {
            if (normalizeId(entry.contact._id) !== normalizeId(activeContact._id)) return entry;
            return {
              ...entry,
              lastMessage: saved,
              lastMessageAt: saved.createdAt,
            };
          })
          .sort((a, b) => {
            if (!a.lastMessageAt) return 1;
            if (!b.lastMessageAt) return -1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          })
      );
    };

    try {
      if (socketService.isConnected()) {
        const response = await socketService.sendMessage(activeContact._id, text);
        if (response.message) {
          finalizeMessage(response.message as unknown as ChatMessage);
          return;
        }
      }

      const res = await messageService.sendMessage(activeContact._id, text);
      if (res.success && res.data) {
        finalizeMessage(res.data);
      } else {
        throw new Error(res.message || 'Failed to send message');
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, failed: true } : m))
      );
      setSendError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const filteredContacts = contacts.filter((entry) => {
    const name = `${entry.contact.firstName} ${entry.contact.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || entry.contact.role.toLowerCase().includes(query);
  });

  return (
    <div className="flex h-full bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden md:min-h-[600px] relative">
      <div
        className={`w-full md:w-96 border-r border-slate-100/80 flex flex-col bg-[#FDF9F2]/20 ${activeContact ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-6 md:p-8 border-b border-slate-100 pl-16 md:pl-8 bg-[#FDF9F2]/40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-semibold text-slate-900 tracking-tight">
              Messages
            </h2>
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
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
              <div className="w-16 h-16 bg-white border border-slate-100 rounded-[20px] flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-base font-playfair font-semibold text-slate-800">No Contacts Yet</p>
              <p className="text-xs text-slate-400 mt-1 font-light max-w-[220px] leading-relaxed">
                Your messaging partners will appear here once you are assigned or have permission to chat.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-1">
              {filteredContacts.map((entry) => {
                const contact = entry.contact;
                const contactId = normalizeId(contact._id);
                const displayName = `${contact.firstName} ${contact.lastName}`;
                const isActive = normalizeId(activeContact?._id) === contactId;
                const unread = entry.unreadCount ?? 0;

                return (
                  <button
                    key={contactId}
                    onClick={() => handleSelectContact(entry)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all relative group border-2 ${isActive ? 'bg-primary/10 border-primary/20 shadow-sm' : 'hover:bg-slate-50/80 border-transparent'}`}
                  >
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-transform group-hover:scale-105 ${isActive ? 'bg-primary text-slate-900 font-bold' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {contact.firstName[0]}
                        {contact.lastName[0]}
                      </div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-0.5 gap-2">
                        <h4
                          className={`font-semibold text-[14px] truncate transition-colors ${isActive ? 'text-primary font-bold' : 'text-slate-800'}`}
                        >
                          {displayName}
                        </h4>
                        {entry.lastMessageAt && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatTime(entry.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-[10px] font-medium tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${isActive ? 'bg-primary/20 text-slate-900' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {contact.role}
                        </span>
                        {entry.lastMessage && (
                          <p className="text-[11px] text-slate-400 truncate flex-1">
                            {entry.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                    {unread > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-[10px] font-bold text-slate-900 flex items-center justify-center">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-[#fafaf7] ${activeContact ? 'flex' : 'hidden md:flex'}`}>
        {activeContact ? (
          <>
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
                    {activeContact.firstName[0]}
                    {activeContact.lastName[0]}
                  </div>
                </div>
                <div>
                  <h3 className="font-playfair font-semibold text-slate-900 text-base tracking-tight">
                    {contactDisplayName(activeContact)}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Shield size={10} className="text-primary" />
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                      {activeContact.role} · {isSocketConnected ? 'Live' : 'Offline mode'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-px h-6 bg-slate-100 mx-1" />
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-xl"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-[#fafaf7]">
              {messagesLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}
                    >
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
                  <p className="text-xs text-slate-400 mt-1 italic font-light">
                    Start a conversation with {contactDisplayName(activeContact)}
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`max-w-[75%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-5 py-3.5 rounded-[24px] text-sm font-normal leading-relaxed shadow-sm transition-all hover:shadow-md ${msg.isMe
                          ? msg.failed
                            ? 'bg-red-50 text-red-900 border border-red-100 rounded-tr-none'
                            : 'bg-slate-900 text-white rounded-tr-none'
                          : 'bg-white text-slate-700 border border-slate-100/80 rounded-tl-none'
                          }`}
                      >
                        {msg.text}
                        {msg.failed && (
                          <AlertCircle className="w-4 h-4 text-red-500 inline ml-2 align-middle" />
                        )}
                      </div>
                      <div className={`flex items-center gap-2 mt-1.5 px-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-slate-400 font-light tracking-wide">
                          {msg.failed ? 'Failed to send' : msg.timestamp}
                        </span>
                        {!msg.failed && msg.isMe && <div className="w-1 h-1 bg-primary rounded-full" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-6 bg-white border-t border-slate-100/60 relative z-10">
              {sendError && (
                <p className="text-xs text-red-500 mb-2 px-2">{sendError}</p>
              )}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-4 bg-[#fafaf7] p-2 rounded-[24px] border border-slate-100 focus-within:border-primary/20 focus-within:bg-white transition-all shadow-sm"
              >
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-white rounded-full"
                >
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
              <h3 className="text-2xl font-playfair font-semibold text-slate-900 mb-2">
                Secure Communications
              </h3>
              <p className="text-slate-400 text-xs font-light max-w-sm mx-auto leading-relaxed">
                Select a contact from the sidebar to start a conversation with your trainer, students, or
                administrators.
              </p>
              <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}
                  />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {isSocketConnected ? 'Live chat connected' : 'REST fallback only'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
