const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 5176;

// Create http server for Render
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" });
  res.end("IntelliMeet Socket Running! Room: " + (req.url || ""));
});

const io = new Server(httpServer, {
  cors: {
    origin: "*", // ALLOW VERCEL!
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

console.log(`Socket server starting on port ${PORT}`);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} JOINING ROOM ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Old signal handler (for old frontend)
  socket.on("signal", ({ to, data }) => {
    console.log(`Signal from ${socket.id} to ${to}`);
    io.to(to).emit("signal", { from: socket.id, data });
  });

  // NEW handlers for 2-person (for my new frontend)
  socket.on("offer", (data) => {
    console.log(`Offer from ${socket.id} to ${data.to}`);
    io.to(data.to).emit("offer", { offer: data.offer, from: socket.id });
  });

  socket.on("answer", (data) => {
    console.log(`Answer from ${socket.id} to ${data.to}`);
    io.to(data.to).emit("answer", { answer: data.answer, from: socket.id });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Socket server running on port ${PORT}`);
});
