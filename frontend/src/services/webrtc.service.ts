import {
  PeerConnectionMap,
  ParticipantState,
  RTC_CONFIG,
  WebRTCSignalPayload,
} from '../types/webrtc.types';
import { getSocket } from './socket.service';

/**
 * WebRTCService manages all peer connections for a single meeting.
 * It is intentionally framework-agnostic so it can be driven by the useWebRTC hook.
 */
export class WebRTCService {
  private peers: PeerConnectionMap = {};
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private meetingId: string;
  private localUserId: string;

  // Callbacks injected by the hook so state updates flow into React
  onParticipantStream: (userId: string, stream: MediaStream) => void = () => {};
  onParticipantLeft: (userId: string) => void = () => {};
  onParticipantStateChange: (state: ParticipantState) => void = () => {};

  constructor(meetingId: string, localUserId: string) {
    this.meetingId = meetingId;
    this.localUserId = localUserId;
  }

  // ─────────────────────────────────────────────
  // Media acquisition
  // ─────────────────────────────────────────────

  async acquireLocalMedia(video = true, audio = true): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
    return this.localStream;
  }

  async acquireScreenShare(): Promise<MediaStream> {
    this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    return this.screenStream;
  }

  stopScreenShare(): void {
    this.screenStream?.getTracks().forEach((t) => t.stop());
    this.screenStream = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  setAudioMuted(muted: boolean): void {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }

  setVideoMuted(muted: boolean): void {
    this.localStream?.getVideoTracks().forEach((t) => (t.enabled = !muted));
  }

  // ─────────────────────────────────────────────
  // Peer connection lifecycle
  // ─────────────────────────────────────────────

  private createPeerConnection(remoteUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Attach local tracks
    this.localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, this.localStream!);
    });

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.onParticipantStream(remoteUserId, remoteStream);
    };

    // Relay ICE candidates via socket
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        getSocket().emit('webrtc:ice-candidate', {
          meetingId: this.meetingId,
          targetUserId: remoteUserId,
          signalType: 'ice-candidate',
          candidate: event.candidate.toJSON(),
        } as WebRTCSignalPayload);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.removePeer(remoteUserId);
      }
    };

    this.peers[remoteUserId] = pc;
    return pc;
  }

  /**
   * Initiates an offer to a remote peer.
   * Called when we receive 'meeting:peer-joined' for a new entrant.
   */
  async initiateOffer(remoteUserId: string): Promise<void> {
    const pc = this.createPeerConnection(remoteUserId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    getSocket().emit('webrtc:offer', {
      meetingId: this.meetingId,
      targetUserId: remoteUserId,
      signalType: 'offer',
      sdp: offer,
    } as WebRTCSignalPayload);
  }

  /**
   * Handles an incoming offer from a peer and sends back an answer.
   */
  async handleOffer(senderUserId: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.createPeerConnection(senderUserId);

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    getSocket().emit('webrtc:answer', {
      meetingId: this.meetingId,
      targetUserId: senderUserId,
      signalType: 'answer',
      sdp: answer,
    } as WebRTCSignalPayload);
  }

  /**
   * Handles an incoming answer from a remote peer.
   */
  async handleAnswer(senderUserId: string, sdp: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peers[senderUserId];
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  /**
   * Adds an ICE candidate received from a remote peer.
   */
  async handleIceCandidate(senderUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peers[senderUserId];
    if (!pc) return;
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  /**
   * Replaces the local video track on all peer connections (used for screen sharing).
   */
  async replaceVideoTrack(newTrack: MediaStreamTrack): Promise<void> {
    for (const pc of Object.values(this.peers)) {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newTrack);
    }
  }

  // ─────────────────────────────────────────────
  // Teardown
  // ─────────────────────────────────────────────

  removePeer(userId: string): void {
    this.peers[userId]?.close();
    delete this.peers[userId];
    this.onParticipantLeft(userId);
  }

  destroy(): void {
    Object.keys(this.peers).forEach((id) => this.removePeer(id));
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.screenStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.screenStream = null;
  }
}
