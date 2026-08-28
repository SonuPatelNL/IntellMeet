import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", userId);
  });
  socket.on("signal", ({ to, from, data }) => {
    io.to(to).emit("signal", { from, data });
  });
});

httpServer.listen(5176, () => console.log("server listening on port 5176"));