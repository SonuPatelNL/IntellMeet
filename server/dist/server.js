"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
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
