import { useEffect, useRef, useState, useCallback } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket.service';
import { Socket } from 'socket.io-client';

interface UseSocketOptions {
  /** JWT access token (used as auth fallback if cookies not present) */
  token?: string;
  autoConnect?: boolean;
}

export const useSocket = ({ token, autoConnect = true }: UseSocketOptions = {}): {
  socket: Socket | null;
  isConnected: boolean;
  disconnect: () => void;
} => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [token, autoConnect]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
  }, []);

  return { socket: socketRef.current, isConnected, disconnect };
};
