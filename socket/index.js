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

    //Cập nhật trạng thái order do admin thực hiện

    socket.on('update status order', (id) => {
      io.emit('update status order', id);
    });

    // Cập nhật trạng thái order do user thực hiện
    socket.on('user update status order', (id) => {
      io.emit('user update status order', id);
    });

    socket.on('create order', (idAdmin) => {
      io.emit('create order', idAdmin);
    });

    socket.on('hidden product', (id) => {
      console.log(id);
      io.emit('hidden product', id);
    });

    console.log('Socket.IO server running...');
  });
};
export default initialSocket;
