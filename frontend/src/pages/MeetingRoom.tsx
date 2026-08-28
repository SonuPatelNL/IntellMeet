import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const displayId = meetingId || window.location.pathname.split('/').pop() || 'test-room';

  console.log('URL ID:', window.location.pathname);

  const {
    localVideoRef,
    remoteVideos,
    isConnected,
    joinRoom,
    leaveRoom,
    participants,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
  } = useWebRTC({
    meetingId: displayId,
  } as any);

  useEffect(() => {
    joinRoom(displayId);
    return () => {
      leaveRoom();
    };
  }, [displayId]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Meeting: {displayId}</h2>
      <p>Status: {isConnected? 'Connected' : 'Connecting...'}</p>
      <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px', background: '#000' }} />
      <div>
        <button onClick={toggleMute}>{isMuted? 'Unmute' : 'Mute'}</button>
        <button onClick={toggleVideo}>{isVideoOff? 'Video On' : 'Video Off'}</button>
        <button onClick={leaveRoom}>Leave</button>
      </div>
      <div>
        {Array.from(remoteVideos?.values?.() || []).map((v: any, i: number) => (
          <video key={i} autoPlay playsInline style={{ width: '300px' }} />
        ))}
      </div>
      <p>Participants: {participants?.size || 0}</p>
    </div>
  );
}
