import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  const handleCreateMeeting = () => {
    const meetingId = crypto.randomUUID() // makes random ID like: 550e8400-e29b-41d4...
    navigate(`/meeting/${meetingId}`) // goes to /meeting/550e8400...
  }

  return (
    <div style={{textAlign: 'center', padding: '50px', background: '#1a1a1a', minHeight: '100vh', color: 'white'}}>
      <h1>IntellMeet</h1>
      <p>Multi-User Video Call</p>
      
      <button 
        onClick={handleCreateMeeting}
        style={{
          padding: '15px 30px', 
          fontSize: '18px', 
          background: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Create Meeting
      </button>
    </div>
  )
}
