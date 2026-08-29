import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function MeetingRoom(){
  const { meetingId } = useParams();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState('Starting...');
  const [hasRemote, setHasRemote] = useState(false);

  useEffect(()=>{
    let localStream: MediaStream;
    const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || (import.meta as any).env?.VITE_BACKEND_URL || 'https://intellmeet-1-8a0d.onrender.com';
    const cleanUrl = typeof SOCKET_URL === 'string'? SOCKET_URL.replace(/\/api\/?$/, '') : SOCKET_URL;

    async function start(){
      try{
        setStatus('Connecting to '+cleanUrl);
        const socket = io(cleanUrl, { transports:['websocket','polling'] });
        socketRef.current = socket;

        setStatus('Getting camera...');
        localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
        if(localRef.current) localRef.current.srcObject = localStream;
        setStatus('Camera OK! Waiting for socket...');

        const pc = new RTCPeerConnection({ iceServers:[{urls:'stun:stun.l.google.com:19302'}] });
        pcRef.current = pc;
        localStream.getTracks().forEach(t=>pc.addTrack(t, localStream));

        pc.ontrack = (e)=>{
          setStatus('✅ 2nd person connected!');
          if(remoteRef.current) remoteRef.current.srcObject = e.streams[0];
          setHasRemote(true);
        };
        pc.onicecandidate = (e)=>{ if(e.candidate) socket.emit('ice-candidate',{candidate:e.candidate, roomId:meetingId}); };

        socket.on('connect', ()=>{
          setStatus('Connected! Joining room '+meetingId);
          socket.emit('join-room', meetingId);
        });

        socket.on('user-joined', async (userId:string)=>{
          setStatus('2nd person joined! Creating offer...');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer',{offer, to:userId, roomId:meetingId});
        });

        socket.on('offer', async ({offer, from}:any)=>{
          setStatus('Received offer, answering...');
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer',{answer, to:from, roomId:meetingId});
        });

        socket.on('answer', async ({answer}:any)=>{
          setStatus('Connected! Showing 2nd video...');
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('ice-candidate', async ({candidate}:any)=>{
          if(candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on('user-left', ()=>{
          setStatus('2nd person left');
          setHasRemote(false);
        });

      }catch(err:any){
        setStatus('Error: '+err.message);
      }
    }
    start();

    return ()=>{
      try{ localStream?.getTracks().forEach(t=>t.stop()); }catch{}
      try{ pcRef.current?.close(); }catch{}
      try{ socketRef.current?.disconnect(); }catch{}
    }
  },[meetingId]);

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0a', color:'#fff', padding:16}}>
      <h3 style={{margin:0}}>Room: {meetingId} - {status}</h3>
      <div style={{display:'flex', gap:12, marginTop:16, flexWrap:'wrap'}}>
        <div style={{position:'relative'}}>
          <video ref={localRef} autoPlay muted playsInline style={{width:400, height:300, background:'#000', borderRadius:12}} />
          <span style={{position:'absolute', bottom:8, left:8, background:'#0008', padding:'2px 8px', borderRadius:6, fontSize:12}}>You</span>
        </div>
        <div style={{position:'relative'}}>
          <video ref={remoteRef} autoPlay playsInline style={{width:400, height:300, background:'#1a1a1a', borderRadius:12, display:hasRemote?'block':'none'}} />
          {!hasRemote && <div style={{width:400, height:300, background:'#1a1a1a', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#888', border:'2px dashed #333', textAlign:'center'}}>Waiting for 2nd person<br/>Share this link:<br/><small style={{fontSize:10}}>{window.location.href}</small></div>}
          {hasRemote && <span style={{position:'absolute', bottom:8, left:8, background:'#0008', padding:'2px 8px', borderRadius:6, fontSize:12}}>Remote</span>}
        </div>
      </div>
      <div style={{marginTop:16, display:'flex', gap:10}}>
        <button onClick={()=>window.location.href='/'} style={{padding:'10px 20px', background:'#ea4335', border:0, color:'#fff', borderRadius:20, cursor:'pointer'}}>Leave</button>
        <button onClick={()=>navigator.clipboard.writeText(window.location.href)} style={{padding:'10px 20px', background:'#333', border:0, color:'#fff', borderRadius:20, cursor:'pointer'}}>Copy Link</button>
      </div>
    </div>
  )
}
