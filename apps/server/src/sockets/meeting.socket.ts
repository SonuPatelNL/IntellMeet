import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.server';
import { MeetingService } from '../modules/meetings/meeting.service';
import { WebRTCSignalPayload, ParticipantState } from './webrtc.types';

/**
 * meeting.socket.ts
 *
 * Handles all real-time events scoped to a meeting room:
 *   - Meeting lifecycle: join, leave, end
 *   - WebRTC signaling relay: offer, answer, ice-candidate
 *   - Participant media-state broadcast: participant:update
 *   - Automatic cleanup on socket disconnect
 *
 * Room naming convention:
 *   meeting:<meetingId>  — all participants of a specific meeting
 *   user:<userId>        — personal room for targeted notifications (set in socket.server.ts)
 */
export const setupMeetingHandlers = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user!.userId;

  // ─────────────────────────────────────────────────────────────────────────────
  // meeting:join
  // Client emits this after receiving a meeting token / navigating to the room.
  // Server:
  //   1. Validates & persists attendance in DB.
  //   2. Joins the Socket.io room.
  //   3. Broadcasts peer-joined to existing participants.
  //   4. Sends the new joiner the list of existing peer IDs so it can initiate offers.
  //   5. Acknowledges success/failure via callback.
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('meeting:join', async (payload: { meetingId: string }, callback?: Function) => {
    try {
      const { meetingId } = payload;

      if (!meetingId) {
        return callback?.({ status: 'error', message: 'meetingId is required' });
      }

      // Persist in DB (validates meeting exists and is joinable)
      await MeetingService.joinMeeting(meetingId, userId);

      // Enter the Socket.io room
      socket.join(`meeting:${meetingId}`);

      // Tell existing participants a new peer has arrived — they will initiate WebRTC offers
      socket.to(`meeting:${meetingId}`).emit('meeting:peer-joined', {
        userId,
        meetingId,
        timestamp: new Date().toISOString(),
      });

      // Collect existing peer IDs so the new joiner can receive offers
      const roomSockets = await io.in(`meeting:${meetingId}`).fetchSockets();
      const existingPeers = roomSockets
        .map((s: any) => s.user?.userId as string | undefined)
        .filter((id): id is string => !!id && id !== userId);

      // Send current peer list back to the joiner
      socket.emit('meeting:existing-peers', { meetingId, peers: existingPeers });

      callback?.({ status: 'success', meetingId });
    } catch (err: any) {
      callback?.({ status: 'error', message: err.message });
      socket.emit('meeting:error', { meetingId: payload?.meetingId, message: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // meeting:leave
  // Client emits this when the user deliberately leaves the meeting UI.
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('meeting:leave', async (payload: { meetingId: string }, callback?: Function) => {
    try {
      const { meetingId } = payload;

      if (!meetingId) {
        return callback?.({ status: 'error', message: 'meetingId is required' });
      }

      await MeetingService.leaveMeeting(meetingId, userId);
      socket.leave(`meeting:${meetingId}`);

      // Notify remaining participants
      socket.to(`meeting:${meetingId}`).emit('meeting:peer-left', {
        userId,
        meetingId,
        timestamp: new Date().toISOString(),
      });

      callback?.({ status: 'success' });
    } catch (err: any) {
      callback?.({ status: 'error', message: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // meeting:end  (host only — enforced at service layer)
  // Ends the meeting for ALL participants: marks DB complete, kicks everyone.
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('meeting:end', async (payload: { meetingId: string }, callback?: Function) => {
    try {
      const { meetingId } = payload;

      if (!meetingId) {
        return callback?.({ status: 'error', message: 'meetingId is required' });
      }

      // Service validates host ownership before ending
      const meeting = await MeetingService.endMeeting(meetingId, userId);

      // Broadcast to ALL participants (including the host) that the meeting is over
      io.in(`meeting:${meetingId}`).emit('meeting:ended', {
        meetingId,
        hostId: userId,
        endTime: meeting.endTime?.toISOString(),
      });

      // Force all sockets in the room to leave
      const roomSockets = await io.in(`meeting:${meetingId}`).fetchSockets();
      for (const s of roomSockets) {
        s.leave(`meeting:${meetingId}`);
      }

      callback?.({ status: 'success' });
    } catch (err: any) {
      callback?.({ status: 'error', message: err.message });
      socket.emit('meeting:error', { meetingId: payload?.meetingId, message: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // WebRTC Signaling Relay
  // The server acts as a pure relay — it never inspects the SDP/ICE content.
  // Signals are delivered to the target user's personal room `user:<userId>`.
  // ─────────────────────────────────────────────────────────────────────────────

  /** Client A → Server → Client B (offer) */
  socket.on('webrtc:offer', (payload: WebRTCSignalPayload) => {
    io.to(`user:${payload.targetUserId}`).emit('webrtc:offer', {
      ...payload,
      senderUserId: userId,
    });
  });

  /** Client B → Server → Client A (answer) */
  socket.on('webrtc:answer', (payload: WebRTCSignalPayload) => {
    io.to(`user:${payload.targetUserId}`).emit('webrtc:answer', {
      ...payload,
      senderUserId: userId,
    });
  });

  /** ICE candidate relay (bidirectional) */
  socket.on('webrtc:ice-candidate', (payload: WebRTCSignalPayload) => {
    io.to(`user:${payload.targetUserId}`).emit('webrtc:ice-candidate', {
      ...payload,
      senderUserId: userId,
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // participant:update
  // Broadcasts media state changes (mute, video, screen-share) to all room peers.
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on(
    'participant:update',
    (payload: Omit<ParticipantState, 'userId'> & { meetingId: string }) => {
      socket.to(`meeting:${payload.meetingId}`).emit('participant:update', {
        userId,
        audioMuted:    payload.audioMuted,
        videoMuted:    payload.videoMuted,
        screenSharing: payload.screenSharing,
      } satisfies ParticipantState);
    }
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Auto-cleanup on disconnect
  // When a socket drops abruptly (network loss, browser close), we:
  //   1. Notify all meeting rooms the peer was in.
  //   2. Attempt to persist leave in the DB for each room.
  // ─────────────────────────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    const meetingRooms = [...socket.rooms].filter((room) => room.startsWith('meeting:'));

    for (const room of meetingRooms) {
      const meetingId = room.replace('meeting:', '');

      // Notify remaining participants immediately (fire-and-forget broadcast)
      socket.to(room).emit('meeting:peer-left', {
        userId,
        meetingId,
        reason: 'disconnect',
        timestamp: new Date().toISOString(),
      });

      // Best-effort DB update — don't await in a loop to avoid blocking the event loop
      MeetingService.leaveMeeting(meetingId, userId).catch((err) => {
        console.error(`[MeetingSocket] leaveMeeting failed on disconnect for ${meetingId}:`, err.message);
      });
    }
  });
};
