const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomID) => { // <-- FIXED: added dash
    const clients = io.sockets.adapter.rooms.get(roomID) || new Set();
    const otherUsers = Array.from(clients).filter(id => id !== socket.id);

    socket.join(roomID);
    console.log(`User ${socket.id} joined room ${roomID}`) // <-- ADD THIS TO DEBUG
    socket.emit("all-users", otherUsers); // <-- FIXED: added dash
  });

  socket.on("sending-signal", payload => { // <-- FIXED: added dash
    io.to(payload.userToSignal).emit('user-joined', { signal: payload.signal, callerID: payload.callerID }); // <-- FIXED: added dash
  });

  socket.on("returning-signal", payload => { // <-- FIXED: added dash
    io.to(payload.callerID).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id }); // <-- FIXED: added dash
  });

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

server.listen(3001, () => console.log('Signaling server on 3001'));