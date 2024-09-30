import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'User',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    classify: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false, default: '' },
    images: [String], //mở rộng
    like: { type: Number, require: false, default: 0 },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
