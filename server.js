import connectDB from './configs/db.config.js';
import app from './app.js';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const DB = process.env.DATABASE_LOCAL;
const DB_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT;

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: 'http://127.0.0.1:5500', // cổng FE
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Các handler cho các sự kiện socket (nếu có)
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

connectDB(DB_URL);

app.listen(PORT, () => {
  console.log(`The server is listening at ${PORT}...`);
});
