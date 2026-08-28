import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';

export default function MeetingRoom() {
  const { meetingId } = useParams() as any;
  const id = meetingId || 'test-room';
  const rtc: any = useWebRTC({ meetingId: id } as any);

  useEffect(() => { rtc.joinRoom?.(id); }, [id]);

  return (
    <div style={{minHeight:'100vh', background:'#111', color:'#fff', padding:20}}>
      <h1>IntelliMeet - {id}</h1>
      <div style={{display:'flex', gap:12, flexWrap:'wrap', marginTop:20}}>
        <div style={{position:'relative', width:400, height:300, background:'#000', borderRadius:16, overflow:'hidden', border:'2px solid #333'}}>
          <video ref={rtc.localVideoRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}} />
          <span style={{position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.6)', padding:'4px 8px', borderRadius:6}}>You</span>
        </div>
        {Array.from(((rtc as any).remoteVideos?.values?.() || []) as any).map((stream: any, i: number) => (
          <div key={i} style={{width:400, height:300, background:'#000', borderRadius:16, overflow:'hidden'}}>
            <video autoPlay playsInline ref={(el:any)=>{if(el && stream) el.srcObject=stream}} style={{width:'100%', height:'100%', objectFit:'cover'}} />
          </div>
        ))}
      </div>
      <div style={{marginTop:20, display:'flex', gap:10}}>
        <button onClick={()=>rtc.toggleMute?.()} style={{padding:'10px 20px', borderRadius:20, border:0, background:'#333', color:'#fff'}}>🎤 Mute</button>
        <button onClick={()=>rtc.toggleVideo?.()} style={{padding:'10px 20px', borderRadius:20, border:0, background:'#333', color:'#fff'}}>📹 Video</button>
        <button onClick={()=>rtc.leaveRoom?.()} style={{padding:'10px 20px', borderRadius:20, border:0, background:'#e53e3e', color:'#fff'}}>Leave</button>
      </div>
      <p style={{marginTop:10, opacity:0.5}}>Open same link in another tab to test 2-person call</p>
    </div>
  );
}
