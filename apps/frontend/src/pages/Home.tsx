import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const createMeeting = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    navigate(`/meeting/${roomId}`);
  }

  return (
    <div style={{padding: '20px', textAlign: 'center', background: '#1a1a2e', color: 'white', height: '100vh'}}>
      <h1>IntellMeet</h1>
      <p>Multi-User Video Call</p>
      <button onClick={createMeeting} style={{padding: '15px 30px', fontSize: '18px', marginTop: '20px', cursor: 'pointer'}}>
        Create Meeting
      </button>
    </div>
  );
}