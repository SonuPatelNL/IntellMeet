import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function MeetingRoom() {
  const { meetingId } = useParams() as any;
  const id = meetingId || 'test-room';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => {
        alert("Camera blocked! Click lock icon in address bar -> Allow Camera & Mic -> Refresh");
        console.error(err);
      });
  }, []);

  const toggleMute = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setMuted(!muted);
  };

  const toggleVideo = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setVideoOff(!videoOff);
  };

  return (
    <div style={{minHeight:'100vh', background:'#111', color:'#fff', padding:20, fontFamily:'sans-serif'}}>
      <h1>IntelliMeet - {id}</h1>
      <div style={{width:400, height:300, background:'#000', borderRadius:16, overflow:'hidden', position:'relative', marginTop:20}}>
        <video ref={videoRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}} />
        {videoOff && <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#000'}}>📷 Video Off</div>}
        <span style={{position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.7)', padding:'4px 8px', borderRadius:6, fontSize:12}}>You {muted ? '🔇' : '🎤'}</span>
      </div>

      <div style={{marginTop:20, display:'flex', gap:10}}>
        <button onClick={toggleMute} style={{padding:'12px 24px', borderRadius:24, border:0, background: muted ? '#e53e3e' : '#2d2d2d', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:'bold'}}>
          {muted ? '🔇 Unmute' : '🎤 Mute'}
        </button>
        <button onClick={toggleVideo} style={{padding:'12px 24px', borderRadius:24, border:0, background: videoOff ? '#e53e3e' : '#2d2d2d', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:'bold'}}>
          {videoOff ? '📷 Video On' : '📹 Video Off'}
        </button>
        <button onClick={()=> window.location.href='/'} style={{padding:'12px 24px', borderRadius:24, border:0, background:'#e53e3e', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:'bold'}}>
          Leave
        </button>
      </div>

      <p style={{marginTop:20, color:'#888', fontSize:13, lineHeight:1.5}}>
        ✅ If video is black: Click 🔒 icon in address bar (left side) → Site Settings → Allow Camera + Mic → Refresh<br/>
        ✅ Buttons will turn RED when clicked
      </p>
    </div>
  );
}
