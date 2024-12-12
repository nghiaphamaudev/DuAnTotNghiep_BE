import { Server } from 'socket.io';

const initialSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
    });

    socket.on('update status order', (id) => {
      console.log(id);
      io.emit('update status order', id);
    });

    socket.on('user update status order', (id) => {
      console.log(id);
      io.emit('user update status order', id);
    });

    console.log('Socket.IO server running...');
  });
};
export default initialSocket;
