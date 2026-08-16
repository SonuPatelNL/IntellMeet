// WebRTC type definitions shared across frontend hooks and services

export type SignalType = 'offer' | 'answer' | 'ice-candidate';

export interface WebRTCSignalPayload {
  meetingId: string;
  targetUserId: string;
  senderUserId?: string;
  signalType: SignalType;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface ParticipantState {
  userId: string;
  audioMuted: boolean;
  videoMuted: boolean;
  screenSharing: boolean;
  stream?: MediaStream;       // Client-side only
}

export interface PeerConnectionMap {
  [userId: string]: RTCPeerConnection;
}

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // TURN servers should be added here for production
  ],
};
