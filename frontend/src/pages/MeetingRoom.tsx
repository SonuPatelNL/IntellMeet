import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://intellmeet-1-8c0f.onrender.com";

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function MeetingRoom() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting...");
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        setStatus(`Room: ${roomId}`);
        socket.emit("join-room", roomId);
      });

      const pc = new RTCPeerConnection(iceServers);
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        setRemoteJoined(true);
        setStatus("Connected! 2 people in call");
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit("ice-candidate", { roomId, candidate: e.candidate });
      };

      socket.on("user-joined", async () => {
        setStatus("2nd person joined, connecting...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      });
      socket.on("offer", async ({ offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      });
      socket.on("answer", async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });
      socket.on("ice-candidate", async ({ candidate }) => {
        if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });
    };
    init();
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled =!t.enabled);
      setMicOn(!micOn);
    }
  };
  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled =!t.enabled);
      setCamOn(!camOn);
    }
  };
  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "white", padding: "15px" }}>
      <h3 style={{ textAlign: "center" }}>{status}</h3>
      <p style={{ textAlign: "center", fontSize: "12px", opacity: 0.6 }}>Room ID: {roomId}</p>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "45vw", maxWidth: "500px", height: "300px", background: "black", borderRadius: "12px", objectFit: "cover" }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "45vw", maxWidth: "500px", height: "300px", background: "#222", borderRadius: "12px", objectFit: "cover" }} />
      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "30px" }}>
        <button onClick={toggleMic} style={{ padding: "12px 20px", borderRadius: "30px", border: "none", background: micOn? "#333" : "red", color: "white", cursor: "pointer", fontSize: "16px" }}>
          {micOn? "🎤 Mic On" : "🔇 Mic Off"}
        </button>
        <button onClick={toggleCam} style={{ padding: "12px 20px", borderRadius: "30px", border: "none", background: camOn? "#333" : "red", color: "white", cursor: "pointer", fontSize: "16px" }}>
          {camOn? "📹 Cam On" : "📹 Cam Off"}
        </button>
        <button onClick={endCall} style={{ padding: "12px 25px", borderRadius: "30px", border: "none", background: "#e53935", color: "white", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>
          ❌ End Call
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <p style={{ color: remoteJoined? "#4caf50" : "orange" }}>
          {remoteJoined? "✅ Remote Connected" : "⏳ Waiting for 2nd person... Share same link!"}
        </p>
      </div>
    </div>
  );
}
