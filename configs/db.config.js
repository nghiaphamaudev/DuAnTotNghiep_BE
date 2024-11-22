import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     await mongoose.connect(
//       'mongodb://localhost:27017,localhost:27018,localhost:27019/Du-an-tot-nghiep',
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         replicaSet: 'rs0',
//       }
//     );
//     console.log('The connect is successfully!');
//   } catch (error) {
//     console.log(error);
//   }
// };
// export default connectDB;

const connectDB = async (db) => {
  try {
    await mongoose.connect(db);
    console.log('The connect is successfully!');
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;
