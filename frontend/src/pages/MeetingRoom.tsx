import { useWebRTC } from "../hooks/useWebRTC"
import { useParams } from "react-router-dom"

export default function MeetingRoom() {
  const { roomId } = useParams()
  const { localStream, toggleMute, toggleVideo, startScreenShare, isMuted, isVideoOff } = useWebRTC(roomId!)

  return (
    <div style={{ padding: '20px', background: '#0a0a0a', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      <h1 style={{ textAlign: 'center', color: '#00ff00' }}>Room: {roomId}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', flex: 1 }}>
        <div style={{ border: '2px solid #00ff00', borderRadius: '10px', overflow: 'hidden', background: 'black' }}>
          <video ref={(el) => el && (el.srcObject = localStream)} autoPlay muted playsInline style={{ width: '100%', background: 'black', borderRadius: '8px' }} />
        </div>
        {[...Array.from(useWebRTC(roomId!).peers.entries())].map(([id, stream]) => (
          <video key={id} ref={(el) => el && (el.srcObject = stream)} autoPlay playsInline style={{ width: '100%', background: 'black', borderRadius: '8px' }} />
        ))}
      </div>

      {/* BUTTONS NOW AT BOTTOM NORMALLY - NO MORE FIXED */}
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#222', borderRadius: '10px', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={toggleMute} style={{ fontSize: '24px', padding: '15px 20px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: isMuted ? 'red' : '#444', color: 'white' }}>
          {isMuted ? '🔇' : '🎤'}
        </button>
        <button onClick={toggleVideo} style={{ fontSize: '24px', padding: '15px 20px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: isVideoOff ? 'red' : '#444', color: 'white' }}>
          {isVideoOff ? '📷' : '📹'}
        </button>
        <button onClick={startScreenShare} style={{ fontSize: '24px', padding: '15px 20px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#444', color: 'white' }}>
          🖥️
        </button>
      </div>
    </div>
  )
}
