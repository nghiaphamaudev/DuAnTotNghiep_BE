import mongoose from 'mongoose';

const connectDB = async (db, maxRetries = 5, delay = 3000) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('The connection is successfully established!');
      return; // Nếu kết nối thành công, thoát khỏi vòng lặp
    } catch (error) {
      retries += 1;
      console.error(
        `Connection failed (Attempt ${retries}/${maxRetries}):`,
        error.message
      );

      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        throw error; // Ném lỗi sau khi hết số lần retry
      }

      console.log(`Retrying connection in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay)); // Chờ trước khi thử lại
    }
  }
};

export default connectDB;
