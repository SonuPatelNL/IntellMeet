import { io, Socket } from 'socket.io-client';

const socketBaseUrl = (import.meta as any).env?.VITE_SOCKET_URL || (import.meta as any).env?.VITE_BACKEND_URL || (import.meta as any).env?.VITE_API_URL || 'https://intellmeet-1-8a0d.onrender.com';

const SOCKET_URL = typeof socketBaseUrl === 'string' ? socketBaseUrl.replace(/\/api\/?$/, '') : 'https://intellmeet-1-8a0d.onrender.com';

let socket: Socket | null = null;

export const connectSocket = (token?: string): Socket => {
  if (socket?.connected) return socket;

  console.log('Connecting socket to:', SOCKET_URL);

  socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: token ? { token } : {},
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { socket, SOCKET_URL };
