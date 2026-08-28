import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';

export default function MeetingRoom() {
  const { meetingId } = useParams() as any;
  const id = meetingId || window.location.pathname.split('/').pop() || 'test-room';
  const rtc: any = useWebRTC({ meetingId: id } as any);
  const localRef = rtc.localVideoRef || useRef(null);

  useEffect(() => {
    rtc.joinRoom?.(id);
  }, [id]);

  return (
    <div style={{padding:20, background:'#0f0f0f', minHeight:'100vh', color:'#fff'}}>
      <h2>IntelliMeet - Room: {id}</h2>
      <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
        <div style={{width:320, height:240, background:'#000', borderRadius:12, overflow:'hidden'}}>
          <video ref={localRef} autoPlay muted playsInline style={{width:'100%', height:'100%'}} />
        </div>
        {(Array.from((rtc.remoteVideos as any)?.values?.() || []) as any[]).map((v: any, i: number) => (
          <video key={i} ref={(el:any)=>{if(el && v) el.srcObject=v}} autoPlay playsInline style={{width:320, height:240, background:'#000', borderRadius:12}} />
        ))}
      </div>
      <div style={{marginTop:20, display:'flex', gap:10}}>
        <button onClick={()=>rtc.toggleMute?.()}>Mute</button>
        <button onClick={()=>rtc.toggleVideo?.()}>Video Off</button>
        <button onClick={()=>rtc.leaveRoom?.()}>Leave</button>
      </div>
      <p style={{marginTop:20, opacity:0.6}}>Participants: {rtc.participants?.length || 1}</p>
    </div>
  );
}
