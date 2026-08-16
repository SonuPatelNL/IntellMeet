import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5177", credentials: true})); // THIS FIXES CORS
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Health check route - THIS IS WHAT FRONTEND CHECKS
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

//ADD THIS NEW ROUTE
app.post('/create-meeting', (req, res) => {
  const meetingId = Math.random().toString(36).substring(7);
  res.json({
   success:true,
   meetingId: meetingId,
   url:`http://localhost:5177/meeting/${meetingId}`
  });
 });

export default app;