import connectDB from './configs/db.config.js';
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const DB = process.env.DATABASE_LOCAL;
const PORT = process.env.PORT;

io.on('connection', (socket) => {
  console.log('A user connected');

  // Xử lý sự kiện 'disconnect'
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  // Xử lý sự kiện tùy chỉnh
  socket.on('chat message', (msg) => {
    console.log('Message: ' + msg);
    // Gửi lại tin nhắn cho tất cả người dùng
    io.emit('chat message', msg);
  });
});

connectDB(DB);

server.listen(PORT, () => {
  console.log(`The server is listening at ${PORT}...`);
});
