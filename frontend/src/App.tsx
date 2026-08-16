 import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MeetingRoom from './pages/MeetingRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/meeting/:id" element={<MeetingRoom />} />
        <Route path="/" element={<h1 style={{color:'white', textAlign:'center', padding:50}}>Go to /meeting/test123</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;