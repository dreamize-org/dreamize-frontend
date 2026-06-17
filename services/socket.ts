import { io, Socket } from 'socket.io-client';
import { BASE_URL, SOCKET_EVENTS } from './constants';

type MessageCallback = (data: { message: Record<string, unknown> }) => void;
type NotificationCallback = (data: { notification: Record<string, unknown> }) => void;
type ConnectionCallback = (connected: boolean) => void;

let socket: Socket | null = null;
const connectionListeners = new Set<ConnectionCallback>();

function notifyConnection(connected: boolean) {
  connectionListeners.forEach((listener) => {
    try {
      listener(connected);
    } catch {
      // ignore listener errors
    }
  });
}

const socketService = {
  connect(): Promise<void> {
    if (socket?.connected) {
      return Promise.resolve();
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      notifyConnection(false);
      return Promise.reject(new Error('Authentication required for chat'));
    }

    return new Promise((resolve, reject) => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      socket = io(BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const handleConnect = () => {
        cleanup();
        notifyConnection(true);
        resolve();
      };

      const handleError = (error: Error) => {
        cleanup();
        notifyConnection(false);
        reject(error);
      };

      const cleanup = () => {
        socket?.off('connect', handleConnect);
        socket?.off('connect_error', handleError);
      };

      socket.on('connect', handleConnect);
      socket.on('connect_error', handleError);
      socket.on('disconnect', () => notifyConnection(false));
      socket.on('connect', () => notifyConnection(true));
    });
  },

  disconnect(): void {
    socket?.disconnect();
    socket = null;
    notifyConnection(false);
  },

  sendMessage(
    recipientId: string,
    text: string,
    attachment?: Record<string, unknown>
  ): Promise<{ success: boolean; message?: Record<string, unknown>; error?: string }> {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(new Error('Chat connection is offline'));
        return;
      }

      socket.emit(
        SOCKET_EVENTS.SEND_MESSAGE,
        { recipientId, text, attachment },
        (response?: { success: boolean; message?: Record<string, unknown>; error?: string }) => {
          if (response?.success) {
            resolve(response);
            return;
          }
          reject(new Error(response?.error || 'Failed to send message'));
        }
      );
    });
  },

  onMessage(cb: MessageCallback): void {
    socket?.on(SOCKET_EVENTS.MESSAGE_RECEIVED, cb);
  },

  onNotification(cb: NotificationCallback): void {
    socket?.on(SOCKET_EVENTS.NEW_NOTIFICATION, cb);
  },

  onConnectionChange(cb: ConnectionCallback): void {
    connectionListeners.add(cb);
    cb(socket?.connected ?? false);
  },

  removeConnectionListener(cb: ConnectionCallback): void {
    connectionListeners.delete(cb);
  },

  removeMessageListener(cb: MessageCallback): void {
    socket?.off(SOCKET_EVENTS.MESSAGE_RECEIVED, cb);
  },

  removeNotificationListener(cb: NotificationCallback): void {
    socket?.off(SOCKET_EVENTS.NEW_NOTIFICATION, cb);
  },

  isConnected(): boolean {
    return socket?.connected ?? false;
  },
};

export default socketService;
