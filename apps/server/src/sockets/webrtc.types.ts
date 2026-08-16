// Shared WebRTC signaling event types used by both server and client.
// This file lives on the server but mirrors what apps/web/src/types/webrtc.types.ts will use.

export type SignalType = 'offer' | 'answer' | 'ice-candidate';

export interface WebRTCSignalPayload {
  meetingId: string;
  targetUserId: string;       // Who this signal is addressed to
  senderUserId?: string;      // Filled in by server before relay
  signalType: SignalType;
  sdp?: RTCSessionDescriptionInit;        // For offer/answer
  candidate?: RTCIceCandidateInit;        // For ice-candidate
}

export interface ParticipantState {
  userId: string;
  audioMuted: boolean;
  videoMuted: boolean;
  screenSharing: boolean;
}
