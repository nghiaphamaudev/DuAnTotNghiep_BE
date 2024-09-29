import mongoose from 'mongoose';

const connectDB = async (db) => {
  try {
    await mongoose.connect(db);
    console.log('The connect is successfully!');
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;
