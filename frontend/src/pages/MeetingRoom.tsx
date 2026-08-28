import { useParams, useNavigate } from "react-router-dom"
import { useWebRTC } from "../hooks/useWebRTC"
import { useEffect } from "react"

export default function MeetingRoom() {
  const { meetingId } = useParams()
  const navigate = useNavigate()

    // Get meeting ID from URL
  const displayId = meetingId || window.location.pathname.split('/').pop() || 'test-room';

  if (!meetingId) {
    console.log('URL ID:', window.location.pathname);
  }

  const { 
    localVideoRef, 
    remoteVideos, 
    isConnected, 
    joinRoom,
    leaveRoom 
  } = useWebRTC()

  useEffect(() => {
    // Join the room when component loads
    joinRoom(displayId)

    // Leave room when component unmounts
    return () => {
      leaveRoom()
    }
  }, [displayId, joinRoom, leaveRoom])

  if (!isConnected) {
    return <div style={{padding: '40px', textAlign: 'center'}}>Connecting to meeting {meetingId}...</div>
  }

  return (
    <div style={{padding: '20px'}}>
      <h1>Meeting Room: {meetingId}</h1>
      
      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px'}}>
        {/* Your Video */}
        <div>
          <h3>You</h3>
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            style={{width: '300px', height: '200px', background: 'black', borderRadius: '8px'}}
          />
        </div>

        {/* Other Participants */}
        {remoteVideos.map((video) => (
          <div key={video.id}>
            <h3>{video.userName || 'Participant'}</h3>
            <video 
              ref={video.ref} 
              autoPlay 
              playsInline 
              style={{width: '300px', height: '200px', background: 'black', borderRadius: '8px'}}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={() => navigate('/')} 
        style={{padding: '10px 20px', marginTop: '20px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
      >
        Leave Meeting
      </button>
    </div>
  )
}
