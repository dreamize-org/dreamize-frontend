import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import type { ApiResponse } from '@/types';
import type { MessageAttachment } from './files';

export type { MessageAttachment };

export interface ChatContactEntry {
  contact: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    profilePicture?: string;
  };
  lastMessage: {
    _id: string;
    text: string;
    attachment?: MessageAttachment;
    createdAt: string;
    senderId: string;
    recipientId: string;
    isRead: boolean;
  } | null;
  lastMessageAt: string | null;
  unreadCount?: number;
}

export interface ChatMessage {
  _id: string;
  senderId: string;
  recipientId: string;
  text: string;
  attachment?: MessageAttachment;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessagePayload {
  recipientId: string;
  text?: string;
  attachment?: MessageAttachment;
}

class MessageService {
  async getContacts(): Promise<ApiResponse<ChatContactEntry[]>> {
    return apiClient.get<ChatContactEntry[]>(API_ENDPOINTS.CHAT_CONTACTS);
  }

  async getMessages(contactId: string): Promise<ApiResponse<ChatMessage[]>> {
    return apiClient.get<ChatMessage[]>(API_ENDPOINTS.CHAT_MESSAGES(contactId));
  }

  async sendMessage(payload: SendMessagePayload): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post<ChatMessage>(API_ENDPOINTS.CHAT_SEND_MESSAGE, payload);
  }

  async markAsRead(contactId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put<{ success: boolean }>(API_ENDPOINTS.CHAT_MARK_READ(contactId));
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<{ count: number }>(API_ENDPOINTS.CHAT_UNREAD_COUNT);
  }
}

export const messageService = new MessageService();

export function getMessagePreview(message: Pick<ChatMessage, 'text' | 'attachment'>): string {
  if (message.text?.trim()) return message.text.trim();
  if (message.attachment) {
    if (message.attachment.mimeType.startsWith('image/')) return 'Photo';
    return message.attachment.name;
  }
  return '';
}
