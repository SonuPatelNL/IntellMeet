import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../modules/auth/auth.service';
import { setupMeetingHandlers } from './meeting.socket';
import { setupChatHandlers } from './chat.socket';
import { setupPresenceHandlers } from './presence.socket';
import { setupNotificationHandlers } from './notification.socket';
import { setupWorkspaceHandlers } from './workspace.socket';
import cookie from 'cookie';
import { socketConnections } from '../monitoring/metrics';

export interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * initSocketServer
 *
 * Bootstraps Socket.io on top of the existing HTTP server.
 *
 * Authentication:
 *   Access token is accepted from two places (in priority order):
 *     1. socket.handshake.auth.token  (preferred — sent by client explicitly)
 *     2. Cookie "accessToken"         (fallback — for browser-native clients)
 *
 * Rooms:
 *   user:<userId>       — personal room joined immediately on connection.
 *                         Used to deliver WebRTC signals & direct notifications.
 *   meeting:<meetingId> — joined via meeting:join event in meeting.socket.ts.
 *   chat:<roomId>       — joined via chat:join event in chat.socket.ts.
 */
let socketServer: Server | undefined;

export const getSocketServer = (): Server | undefined => socketServer;

export const initSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    // Recommended: ping every 25 s, disconnect after 60 s without pong
    pingInterval: 25000,
    pingTimeout:  60000,
  });

  // ─── Authentication Middleware ──────────────────────────────────────────────
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      // 1. Token from handshake auth payload
      let token: string | undefined = socket.handshake.auth?.token;

      // 2. Fallback: parse from cookie header
      if (!token && socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.accessToken;
      }

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const payload = AuthService.verifyAccessToken(token);
      socket.user = payload;
      next();
    } catch {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // ─── Connection Handler ─────────────────────────────────────────────────────
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user!.userId;

    console.log(`[Socket] Connected: ${socket.id} (userId=${userId})`);
    try {
      socketConnections.inc(1);
    } catch {}

    // Join personal room for targeted delivery (WebRTC signals, notifications)
    socket.join(`user:${userId}`);

    // Register module handlers
    setupPresenceHandlers(io, socket);   // Global presence (must be first)
    setupMeetingHandlers(io, socket);    // Meeting lifecycle + WebRTC relay
    setupChatHandlers(io, socket);       // Chat messages + typing indicators
    setupNotificationHandlers(io, socket); // Notifications and preference updates
    setupWorkspaceHandlers(io, socket);  // Workspace room membership for real-time boards

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (userId=${userId}, reason=${reason})`);
      try {
        socketConnections.dec(1);
      } catch {}
    });

    // Surface socket-level errors back to the client
    socket.on('error', (err: Error) => {
      console.error(`[Socket] Error on ${socket.id}:`, err.message);
      socket.emit('socket:error', { message: err.message });
    });
  });

  socketServer = io;
  return io;
};
