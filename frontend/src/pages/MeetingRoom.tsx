import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function MeetingRoom(){
  const { meetingId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState('Starting...');

  useEffect(()=>{
    setLogs('Asking for camera...');
    navigator.mediaDevices.getUserMedia({video:true, audio:true})
     .then(stream=>{
        setLogs('Camera OK! Joining room: '+meetingId);
        if(videoRef.current) videoRef.current.srcObject = stream;
      })
     .catch(err=>{
        setError('Camera error: '+err.message);
        setLogs('Failed: '+err.message);
      });
  },[meetingId]);

  // Try to load useWebRTC safely
  let remoteCount = 0;
  try{
    // Dynamic import so it doesn't crash page
    const { useWebRTC } = require('../hooks/useWebRTC');
    // If it loads, we will use it later
  }catch(e:any){ console.log('webrtc hook error', e) }

  if(error) return <div style={{padding:40, background:'#111', color:'#fff', minHeight:'100vh'}}><h2>Error</h2><p>{error}</p><p>Allow camera permission!</p><button onClick={()=>window.location.reload()}>Reload</button></div>;

  return (
    <div style={{minHeight:'100vh', background:'#111', color:'#fff', padding:20}}>
      <h2>IntelliMeet - {meetingId}</h2>
      <p style={{color:'#0f0', fontSize:12}}>{logs}</p>

      <div style={{marginTop:20, display:'flex', gap:20, flexWrap:'wrap'}}>
        <div style={{width:400, height:300, background:'#000', borderRadius:12, overflow:'hidden'}}>
          <video ref={videoRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}} />
        </div>
        <div style={{width:400, height:300, background:'#222', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#888'}}>
          Waiting for 2nd person...
        </div>
      </div>

      <div style={{marginTop:20}}>
        <button onClick={()=>window.location.href='/'} style={{padding:'10px 20px', background:'red', color:'#fff', border:0, borderRadius:20}}>Leave</button>
        <p style={{marginTop:10, color:'#888', fontSize:11}}>Link: {window.location.href}</p>
      </div>
    </div>
  )
}
