    import express from 'express'
    import cors from 'cors';

    const app = express()
    app.use(cors({ origin: "http://localhost:5177", credentials: true }));
    app.use(express.json())

    app.get('/health', (req, res) => {
      res.json({ status: "ok" })
    })

    app.post('/create-meeting', (req, res) => {
      const meetingId = Math.random().toString(36).substring(7);
      res.json({
        success: true,
        meetingId: meetingId,
        link: `http://localhost:5177/meeting/${meetingId}`
      });
    });

    const PORT = 5176
    app.listen(PORT, () => {
      console.log(`server listening on port ${PORT}`)
    })