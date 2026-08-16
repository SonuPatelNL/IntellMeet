import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.server';
import Message from '../modules/chat/message.model';

/**
 * chat.socket.ts
 *
 * Handles real-time chat for meeting rooms, workspace channels, and project threads.
 *
 * Room naming convention:
 *   chat:<roomId>   — a chat room where roomId == meetingId | workspaceId | projectId
 *
 * Events (client → server):
 *   chat:join       — join a chat room to receive messages
 *   chat:leave      — leave a chat room
 *   chat:message    — send a message (persisted to DB, broadcast to room)
 *   user:typing     — typing indicator with auto-clear after TTL
 *
 * Events (server → client):
 *   chat:message    — new message payload (broadcast)
 *   user:typing     — { userId, isTyping } (broadcast to room except sender)
 */
export const setupChatHandlers = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user!.userId;

  // Track per-socket typing timers so we can auto-clear them
  const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ─────────────────────────────────────────────────────────────────────────────
  // chat:join
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('chat:join', (payload: { roomId: string }, callback?: Function) => {
    if (!payload?.roomId) {
      return callback?.({ status: 'error', message: 'roomId is required' });
    }

    socket.join(`chat:${payload.roomId}`);
    callback?.({ status: 'success', roomId: payload.roomId });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // chat:leave
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('chat:leave', (payload: { roomId: string }, callback?: Function) => {
    if (!payload?.roomId) {
      return callback?.({ status: 'error', message: 'roomId is required' });
    }

    // Clear any pending typing timer for this room
    _clearTypingTimer(payload.roomId);

    socket.leave(`chat:${payload.roomId}`);
    callback?.({ status: 'success' });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // chat:message
  // Persists the message to MongoDB then broadcasts to the entire room
  // (including the sender so they get the server-assigned _id & timestamp).
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on(
    'chat:message',
    async (
      payload: {
        roomId: string;
        content: string;
        meetingId?: string;
        workspaceId?: string;
        projectId?: string;
      },
      callback?: Function
    ) => {
      try {
        if (!payload?.roomId || !payload?.content?.trim()) {
          return callback?.({ status: 'error', message: 'roomId and content are required' });
        }

        // Cancel typing indicator for this sender on send
        _clearTypingTimer(payload.roomId);
        socket.to(`chat:${payload.roomId}`).emit('user:typing', { userId, isTyping: false });

        // Persist to DB
        const message = await Message.create({
          content: payload.content.trim(),
          senderId: userId,
          meetingId:   payload.meetingId,
          workspaceId: payload.workspaceId,
          projectId:   payload.projectId,
        });

        // Populate sender for consistent response shape
        await message.populate('senderId', 'name avatarUrl');

        // Broadcast to all room members (including sender)
        io.to(`chat:${payload.roomId}`).emit('chat:message', {
          _id:        message._id,
          content:    message.content,
          senderId:   message.senderId,
          meetingId:  message.meetingId,
          workspaceId: message.workspaceId,
          projectId:  message.projectId,
          createdAt:  message.createdAt,
        });

        callback?.({ status: 'success', data: { messageId: message._id } });
      } catch (error: any) {
        callback?.({ status: 'error', message: error.message });
        socket.emit('chat:error', { message: error.message });
      }
    }
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // user:typing
  // Broadcasts a typing indicator to the room (excluding the sender).
  // Auto-clears after 4 seconds of no further "isTyping: true" events
  // to handle cases where the client forgets to send "isTyping: false".
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('user:typing', (payload: { roomId: string; isTyping: boolean }) => {
    if (!payload?.roomId) return;

    const { roomId, isTyping } = payload;

    // Broadcast to everyone else in the room
    socket.to(`chat:${roomId}`).emit('user:typing', { userId, isTyping });

    // Clear any existing auto-stop timer
    _clearTypingTimer(roomId);

    if (isTyping) {
      // Auto-emit "stopped typing" after 4 s if the client goes silent
      const timer = setTimeout(() => {
        socket.to(`chat:${roomId}`).emit('user:typing', { userId, isTyping: false });
        typingTimers.delete(roomId);
      }, 4000);

      typingTimers.set(roomId, timer);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Cleanup on disconnect
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    // Clear all typing timers
    for (const [, timer] of typingTimers) {
      clearTimeout(timer);
    }
    typingTimers.clear();
  });

  // ─── Private helpers ────────────────────────────────────────────────────────

  function _clearTypingTimer(roomId: string) {
    const existing = typingTimers.get(roomId);
    if (existing) {
      clearTimeout(existing);
      typingTimers.delete(roomId);
    }
  }
};
