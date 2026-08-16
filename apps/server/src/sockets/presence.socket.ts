import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.server';
import { redis } from '../config/redis';

/**
 * presence.socket.ts
 *
 * Manages global user online/offline presence via Redis.
 *
 * Redis keys:
 *   presence:<userId>  — stores { status, lastSeen } as a JSON string.
 *                        TTL is set to 30 s and refreshed on heartbeat.
 *
 * Events (client → server):
 *   presence:heartbeat — keeps the online status alive (client should emit every ~15 s)
 *
 * Events (server → client):
 *   presence:online    — { userId } — a user came online (broadcast to all)
 *   presence:offline   — { userId, lastSeen } — a user went offline (broadcast to all)
 *   presence:status    — response to a presence:query request
 *
 * Note: participant:update (media state) lives in meeting.socket.ts because it
 * is scoped to a meeting room, not global presence.
 */

const PRESENCE_TTL_SECONDS = 30;
const PRESENCE_KEY = (uid: string) => `presence:${uid}`;

interface PresenceData {
  status: 'online' | 'offline';
  lastSeen: string; // ISO string
}

export const setupPresenceHandlers = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user!.userId;

  // ─────────────────────────────────────────────────────────────────────────────
  // Mark user online on connect
  // ─────────────────────────────────────────────────────────────────────────────
  const markOnline = async () => {
    const data: PresenceData = {
      status: 'online',
      lastSeen: new Date().toISOString(),
    };

    await redis.set(PRESENCE_KEY(userId), JSON.stringify(data), 'EX', PRESENCE_TTL_SECONDS);
    // Broadcast to all connected clients
    io.emit('presence:online', { userId });
  };

  markOnline().catch((err) => {
    console.error('[PresenceSocket] Failed to mark user online:', err.message);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // presence:heartbeat
  // Clients should emit this every ~15 s to keep their online status alive.
  // Without a heartbeat the Redis key expires after PRESENCE_TTL_SECONDS.
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('presence:heartbeat', async () => {
    const data: PresenceData = {
      status: 'online',
      lastSeen: new Date().toISOString(),
    };

    await redis
      .set(PRESENCE_KEY(userId), JSON.stringify(data), 'EX', PRESENCE_TTL_SECONDS)
      .catch((err) => console.error('[PresenceSocket] Heartbeat failed:', err.message));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // presence:query
  // Client requests current status of a specific user.
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('presence:query', async (payload: { targetUserId: string }, callback?: Function) => {
    try {
      const raw = await redis.get(PRESENCE_KEY(payload.targetUserId));
      const data: PresenceData = raw
        ? (JSON.parse(raw) as PresenceData)
        : { status: 'offline', lastSeen: new Date(0).toISOString() };

      callback?.({ status: 'success', data: { userId: payload.targetUserId, ...data } });
    } catch (err: any) {
      callback?.({ status: 'error', message: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Mark user offline on disconnect
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    const lastSeen = new Date().toISOString();

    // Delete the live presence key
    await redis.del(PRESENCE_KEY(userId)).catch((err) => {
      console.error('[PresenceSocket] Failed to delete presence key:', err.message);
    });

    // Broadcast offline status to all
    io.emit('presence:offline', { userId, lastSeen });
  });
};
