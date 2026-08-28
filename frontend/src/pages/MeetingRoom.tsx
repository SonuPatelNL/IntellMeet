import { useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
export default function MeetingRoom() {
  const { meetingId } = useParams() as any;
  const id = meetingId || 'test';
  const rtc: any = useWebRTC({ meetingId: id } as any);
  return <div><h1>Meeting: {id}</h1><video ref={rtc.localVideoRef} autoPlay muted playsInline style={{width:300,background:'#000'}} /><button onClick={()=>rtc.joinRoom(id)}>Join</button></div>;
}
