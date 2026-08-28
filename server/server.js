const { Server } = require("socket.io");

const io = new Server(5176, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

console.log("Socket server running on port 5176");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} JOINING ROOM ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // This handles BOTH sdp and ice candidates
  socket.on("signal", ({ to, data }) => {
    console.log(`Signal from ${socket.id} to ${to}`);
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
