import mongoose from 'mongoose';

const RoundRobinSchema = new mongoose.Schema({
  currentIndex: { type: Number, default: 0 },
});

const RoundRobin = mongoose.model('RoundRobin', RoundRobinSchema);

export default RoundRobin;
