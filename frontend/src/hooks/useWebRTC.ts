import { useEffect, useRef, useState, useCallback } from 'react';
import { WebRTCService } from '../services/webrtc.service';
import { getSocket } from '../services/socket.service';
import { ParticipantState, WebRTCSignalPayload } from '../types/webrtc.types';

interface UseWebRTCOptions {
  meetingId: string;
  localUserId: string;
  enableVideo?: boolean;
  enableAudio?: boolean;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  participants: Map<string, ParticipantState>;
  audioMuted: boolean;
  videoMuted: boolean;
  isScreenSharing: boolean;
  joinMeetingRoom: () => Promise<void>;
  leaveMeetingRoom: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
}

export const useWebRTC = ({
  meetingId,
  localUserId,
  enableVideo = true,
  enableAudio = true,
}: UseWebRTCOptions = {} as UseWebRTCOptions): UseWebRTCReturn => {
  const serviceRef = useRef<WebRTCService | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Map<string, ParticipantState>>(new Map());
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const updateParticipant = useCallback((userId: string, updates: Partial<ParticipantState>) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      const existing = next.get(userId) ?? { userId, audioMuted: false, videoMuted: false, screenSharing: false };
      next.set(userId, { ...existing, ...updates });
      return next;
    });
  }, []);

  const removeParticipant = useCallback((userId: string) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  // ─────────────────────────────────────────────
  // Join meeting room: acquire media + register socket listeners
  // ─────────────────────────────────────────────
  const joinMeetingRoom = useCallback(async () => {
    const svc = new WebRTCService(meetingId, localUserId);
    serviceRef.current = svc;

    // Wire up callbacks
    svc.onParticipantStream = (userId, stream) => {
      updateParticipant(userId, { stream } as any);
    };
    svc.onParticipantLeft = (userId) => removeParticipant(userId);
    svc.onParticipantStateChange = (state) => updateParticipant(state.userId, state);

    // Acquire local media
    const stream = await svc.acquireLocalMedia(enableVideo, enableAudio);
    setLocalStream(stream);

    const socket = getSocket();

    // ── Socket event listeners ──────────────────
    socket.on('meeting:peer-joined', async ({ userId }: { userId: string }) => {
      // We are the existing peer; send an offer to the newcomer
      await svc.initiateOffer(userId);
    });

    socket.on('meeting:existing-peers', async ({ peers }: { peers: string[] }) => {
      // We are the new joiner; existing peers will send us offers, so just add them to state
      peers.forEach((uid) => updateParticipant(uid, { userId: uid, audioMuted: false, videoMuted: false, screenSharing: false }));
    });

    socket.on('meeting:peer-left', ({ userId }: { userId: string }) => {
      svc.removePeer(userId);
    });

    socket.on('webrtc:offer', async (payload: WebRTCSignalPayload) => {
      if (!payload.sdp || !payload.senderUserId) return;
      await svc.handleOffer(payload.senderUserId, payload.sdp);
    });

    socket.on('webrtc:answer', async (payload: WebRTCSignalPayload) => {
      if (!payload.sdp || !payload.senderUserId) return;
      await svc.handleAnswer(payload.senderUserId, payload.sdp);
    });

    socket.on('webrtc:ice-candidate', async (payload: WebRTCSignalPayload) => {
      if (!payload.candidate || !payload.senderUserId) return;
      await svc.handleIceCandidate(payload.senderUserId, payload.candidate);
    });

    socket.on('participant:update', (state: ParticipantState) => {
      updateParticipant(state.userId, state);
    });

    // Tell the server we've joined
    socket.emit('meeting:join', { meetingId });
  }, [meetingId, localUserId, enableVideo, enableAudio, updateParticipant, removeParticipant]);

  // ─────────────────────────────────────────────
  // Leave meeting room: teardown
  // ─────────────────────────────────────────────
  const leaveMeetingRoom = useCallback(() => {
    const socket = getSocket();
    socket.emit('meeting:leave', { meetingId });
    socket.off('meeting:peer-joined');
    socket.off('meeting:peer-left');
    socket.off('meeting:existing-peers');
    socket.off('webrtc:offer');
    socket.off('webrtc:answer');
    socket.off('webrtc:ice-candidate');
    socket.off('participant:update');

    serviceRef.current?.destroy();
    serviceRef.current = null;
    setLocalStream(null);
    setParticipants(new Map());
  }, [meetingId]);

  // ─────────────────────────────────────────────
  // Controls
  // ─────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const next = !audioMuted;
    serviceRef.current?.setAudioMuted(next);
    setAudioMuted(next);
    getSocket().emit('participant:update', { meetingId, audioMuted: next, videoMuted, screenSharing: isScreenSharing });
  }, [audioMuted, videoMuted, isScreenSharing, meetingId]);

  const toggleVideo = useCallback(() => {
    const next = !videoMuted;
    serviceRef.current?.setVideoMuted(next);
    setVideoMuted(next);
    getSocket().emit('participant:update', { meetingId, audioMuted, videoMuted: next, screenSharing: isScreenSharing });
  }, [audioMuted, videoMuted, isScreenSharing, meetingId]);

  const toggleScreenShare = useCallback(async () => {
    const svc = serviceRef.current;
    if (!svc) return;

    if (!isScreenSharing) {
      const screenStream = await svc.acquireScreenShare();
      const videoTrack = screenStream.getVideoTracks()[0];
      await svc.replaceVideoTrack(videoTrack);
      // When the user stops sharing via browser UI
      videoTrack.onended = () => toggleScreenShare();
      setIsScreenSharing(true);
      getSocket().emit('participant:update', { meetingId, audioMuted, videoMuted, screenSharing: true });
    } else {
      svc.stopScreenShare();
      const localVideoTrack = svc.getLocalStream()?.getVideoTracks()[0];
      if (localVideoTrack) await svc.replaceVideoTrack(localVideoTrack);
      setIsScreenSharing(false);
      getSocket().emit('participant:update', { meetingId, audioMuted, videoMuted, screenSharing: false });
    }
  }, [isScreenSharing, audioMuted, videoMuted, meetingId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveMeetingRoom();
    };
  }, [leaveMeetingRoom]);

  return {
    localStream,
    participants,
    audioMuted,
    videoMuted,
    isScreenSharing,
    joinMeetingRoom,
    leaveMeetingRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
};
