import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://intellmeet-1-8c0f.onrender.com";

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function MeetingRoom() {
  const { id: roomId } = useParams();
  const [status, setStatus] = useState("Waiting for socket...");
  const [remoteJoined, setRemoteJoined] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get Camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setStatus("Camera started! Connecting to socket...");

        // 2. Connect Socket
        const socket = io(SOCKET_URL, {
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          setStatus(`Connected! Joining room ${roomId}...`);
          socket.emit("join-room", roomId);
        });

        socket.on("connect_error", (err) => {
          setStatus(`Socket error: ${err.message}`);
        });

        // 3. Setup Peer Connection with STUN (FIX FOR BLACK SCREEN)
        const pc = new RTCPeerConnection(iceServers);
        pcRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Get remote tracks
        pc.ontrack = (event) => {
          console.log("Got remote track!");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setRemoteJoined(true);
          setStatus("2nd person connected! Video ON!");
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { roomId, candidate: event.candidate });
          }
        };

        // 4. Socket Events for WebRTC
        socket.on("user-joined", async (userId: string) => {
          setStatus(`User ${userId} joined! Creating offer...`);
          // This peer is initiator
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { roomId, offer });
        });

        socket.on("offer", async ({ offer }) => {
          setStatus("Received offer, creating answer...");
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { roomId, answer });
        });

        socket.on("answer", async ({ answer }) => {
          setStatus("Received answer, connecting video...");
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async ({ candidate }) => {
          if (candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socket.on("user-left", () => {
          setStatus("Other user left");
          setRemoteJoined(false);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });

      } catch (err: any) {
        setStatus(`Camera error: ${err.message}`);
      }
    };

    init();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  return (
    <div style={{ padding: "20px", background: "#111", color: "white", minHeight: "100vh" }}>
      <h2>Room: {roomId}</h2>
      <p style={{ background: "#333", padding: "10px", borderRadius: "8px" }}>{status}</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        <div>
          <h4>You (Local)</h4>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "320px", height: "240px", background: "black", borderRadius: "10px" }} />
        </div>
        <div>
          <h4>Remote {remoteJoined? "✅ Connected" : "❌ Waiting"}</h4>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "320px", height: "240px", background: "black", borderRadius: "10px" }} />
        </div>
      </div>
    </div>
  );
}
