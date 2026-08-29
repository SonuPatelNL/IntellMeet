import { useWebRTC } from '../hooks/useWebRTC';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function MeetingRoom(){
  const { meetingId } = useParams();
  const { localVideoRef, remoteVideos, joinRoom, toggleAudio, toggleVideo, isAudioEnabled, isVideoEnabled, isConnected } = useWebRTC({meetingId: meetingId!});

  useEffect(()=>{ joinRoom(meetingId!); }, [meetingId]);

  return (
    <div style={{background:'#111', minHeight:'100vh', padding:20, color:'#fff'}}>
      <h2>Room: {meetingId} {isConnected?'🟢':'🔴'}</h2>
      <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
        <video ref={localVideoRef} autoPlay muted playsInline style={{width:400, height:300, background:'#000', borderRadius:12}} />
        {Array.from(remoteVideos.values()).map((s:any,i)=>
          <video key={i} autoPlay playsInline ref={(el:any)=>{if(el) el.srcObject=s}} style={{width:400, height:300, background:'#222', borderRadius:12}} />
        )}
      </div>
      <div style={{marginTop:15, display:'flex', gap:10}}>
        <button onClick={()=>toggleAudio()} style={{padding:'10px 20px', borderRadius:20}}>{isAudioEnabled?'Mute':'Unmute'}</button>
        <button onClick={()=>toggleVideo()} style={{padding:'10px 20px', borderRadius:20}}>{isVideoEnabled?'Cam Off':'Cam On'}</button>
        <button onClick={()=>window.location.href='/'} style={{padding:'10px 20px', background:'red', color:'#fff', borderRadius:20}}>Leave</button>
      </div>
      <p style={{color:'#aaa', marginTop:10}}>{remoteVideos.size===0?'Waiting for other person to join same link...':'✅ Connected! '+ (remoteVideos.size+1)+' people'}</p>
    </div>
  )
}
