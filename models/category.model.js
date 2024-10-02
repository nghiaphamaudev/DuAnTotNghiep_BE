import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    categorySeason: {
      type: mongoose.Schema.ObjectId,
      ref: 'CategorySeason',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
