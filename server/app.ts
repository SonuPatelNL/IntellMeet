import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"] 
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    console.log(`${socket.id} joined ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", (data: any) => {
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data: any) => {
    socket.to(data.roomId).emit("answer", data);
  });

  socket.on("ice-candidate", (data: any) => {
    socket.to(data.roomId).emit("ice-candidate", data);
  });
});

server.listen(5176, () => {
  console.log("Signaling server on 5176");
});
