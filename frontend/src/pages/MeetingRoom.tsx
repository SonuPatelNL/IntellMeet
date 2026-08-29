import { useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { useEffect, useState } from 'react';

export default function MeetingRoom(){
  const { meetingId } = useParams();
  const [joined, setJoined] = useState(false);
  const { localVideoRef, remoteVideos, joinRoom } = useWebRTC({ meetingId: meetingId! });

  useEffect(()=>{
    if(meetingId &&!joined){
      console.log('Joining room:', meetingId);
      joinRoom(meetingId);
      setJoined(true);
    }
  },[meetingId]);

  return (
    <div style={{minHeight:'100vh', background:'#0f0f0f', color:'#fff', padding:20}}>
      <h3 style={{margin:0}}>IntelliMeet: {meetingId} | Online: {remoteVideos.size + 1}</h3>
      <div style={{display:'flex', gap:16, marginTop:20, flexWrap:'wrap'}}>
        <div style={{position:'relative'}}>
          <video ref={localVideoRef} autoPlay muted playsInline style={{width:360, height:270, background:'#000', borderRadius:12, objectFit:'cover'}} />
          <span style={{position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.6)', padding:'2px 8px', borderRadius:8, fontSize:12}}>You</span>
        </div>
        {Array.from(remoteVideos.entries()).map(([id, stream])=>(
          <div key={id} style={{position:'relative'}}>
            <video autoPlay playsInline style={{width:360, height:270, background:'#222', borderRadius:12, objectFit:'cover'}} ref={el=>{if(el && stream) el.srcObject = stream as MediaStream}} />
            <span style={{position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.6)', padding:'2px 8px', borderRadius:8, fontSize:12}}>{id.slice(0,5)}</span>
          </div>
        ))}
        {remoteVideos.size===0 && <div style={{width:360, height:270, background:'#1a1a1a', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#888', border:'2px dashed #333'}}>Waiting for 2nd person... Share link: {window.location.href}</div>}
      </div>
      <div style={{marginTop:20, display:'flex', gap:10}}>
        <button onClick={()=>window.location.href='/'} style={{padding:'10px 24px', background:'#ea4335', color:'#fff', border:0, borderRadius:24, cursor:'pointer'}}>Leave</button>
        <button onClick={()=>navigator.clipboard.writeText(window.location.href)} style={{padding:'10px 24px', background:'#333', color:'#fff', border:0, borderRadius:24, cursor:'pointer'}}>Copy Link</button>
      </div>
    </div>
  )
}
