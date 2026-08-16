 const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3001;

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (meetingId, userId) => {
    socket.join(meetingId);
    socket.to(meetingId).emit("user-connected", userId);
    console.log(`User ${userId} joined room ${meetingId}`);

    socket.on("disconnect", () => {
      socket.to(meetingId).emit("user-disconnected", userId);
    });
  });

  socket.on("offer", (offer, meetingId, userId) => {
    socket.to(meetingId).emit("offer", offer, userId);
  });
  socket.on("answer", (answer, meetingId, userId) => {
    socket.to(meetingId).emit("answer", answer, userId);
  });
  socket.on("ice-candidate", (candidate, meetingId, userId) => {
    socket.to(meetingId).emit("ice-candidate", candidate, userId);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
