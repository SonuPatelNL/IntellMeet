import { io, Socket } from 'socket.io-client';

const socketBaseUrl = (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env?.VITE_API_URL;
const SOCKET_URL = typeof socketBaseUrl === 'string' ? socketBaseUrl : 'http://localhost:5176';

let socket: Socket | null = null;

/**
 * Initialises a singleton Socket.io connection.
 * Call once on app mount after authentication.
 */
export const connectSocket = (token?: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,           // Send httpOnly cookies
    auth: token ? { token } : {},    // Fallback: send token in auth payload
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.warn('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error('Socket not initialised. Call connectSocket() first.');
  return socket;
};
