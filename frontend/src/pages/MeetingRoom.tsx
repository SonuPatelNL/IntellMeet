import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';

export default function MeetingRoom() {
  const { meetingId } = useParams() as any;
  const id = meetingId || 'test-room';
  const rtc: any = useWebRTC({ meetingId: id } as any);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    rtc.joinRoom?.(id);
    // Fallback: get camera directly if hook doesn't
    if (!rtc.localVideoRef?.current?.srcObject) {
      navigator.mediaDevices.getUserMedia({video:true, audio:true})
       .then((s:any)=>{
          if (rtc.localVideoRef?.current) rtc.localVideoRef.current.srcObject = s;
        }).catch(()=>{});
    }
  }, [id]);

  const handleMute = () => {
    if (rtc.toggleMute) rtc.toggleMute();
    else {
      const stream = rtc.localVideoRef?.current?.srcObject || rtc.localStream;
      stream?.getAudioTracks()?.forEach((t:any)=>t.enabled = muted);
      setMuted(!muted);
    }
  };

  const handleVideo = () => {
    if (rtc.toggleVideo) rtc.toggleVideo();
    else {
      const stream = rtc.localVideoRef?.current?.srcObject || rtc.localStream;
      stream?.getVideoTracks()?.forEach((t:any)=>t.enabled = videoOff);
      setVideoOff(!videoOff);
    }
  };

  return (
    <div style={{minHeight:'100vh', background:'#111', color:'#fff', padding:20}}>
      <h1>IntelliMeet - {id}</h1>
      <div style={{width:400, height:300, background:'#000', borderRadius:16, overflow:'hidden'}}>
        <video ref={rtc.localVideoRef} autoPlay muted playsInline style={{width:'100%', height:'100%'}} />
      </div>
      <div style={{marginTop:20, display:'flex', gap:10}}>
        <button onClick={handleMute} style={{padding:'10px 20px', borderRadius:20, border:0, background: muted?'#e53e3e':'#333', color:'#fff'}}>{muted?'Unmute':'Mute'}</button>
        <button onClick={handleVideo} style={{padding:'10px 20px', borderRadius:20, border:0, background: videoOff?'#e53e3e':'#333', color:'#fff'}}>{videoOff?'Video On':'Video Off'}</button>
        <button onClick={()=>{rtc.leaveRoom?.(); window.location.href='/'}} style={{padding:'10px 20px', borderRadius:20, border:0, background:'#e53e3e', color:'#fff'}}>Leave</button>
      </div>
      <p style={{marginTop:10, color:'#aaa'}}>1. Click address bar lock icon -> Allow Camera/Mic<br/>2. Refresh<br/>3. Open same link in phone = 2 person call</p>
    </div>
  );
}
