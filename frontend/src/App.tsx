 import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MeetingRoom from './pages/MeetingRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page with Create Meeting button */}
        <Route path="/" element={<Home />} />
        
        {/* Meeting room page with ID in URL */}
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
