import mongoose from 'mongoose';
const categorySeasonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A category season must to have a name !'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

const CategorySeason = mongoose.model('CategorySeason', categorySeasonSchema);
export default CategorySeason;
