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
    classify: { type: Boolean, default: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false, default: '' },
    images: [String], //mở rộng
    like: { type: Number, require: false, default: 0 },
    likedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
      },
      timestamps: true,
      versionKey: false,
    },
  }
);
feedbackSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
