import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    console.log(`${userId} joined room ${roomId}`);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("offer", (offer, to) => socket.to(to).emit("offer", offer, userId));
    socket.on("answer", (answer, to) => socket.to(to).emit("answer", answer, userId));
    socket.on("ice-candidate", (candidate, to) => socket.to(to).emit("ice-candidate", candidate, userId));

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(3001, () => console.log("Signaling server running on http://localhost:3001"));