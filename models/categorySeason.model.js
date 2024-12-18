import mongoose from 'mongoose';
const categorySeasonSchema = new mongoose.Schema(
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
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter'], // Các mùa
      required: [true, 'A category must have a season'],
    },
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
categorySeasonSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const CategorySeason = mongoose.model('CategorySeason', categorySeasonSchema);
export default CategorySeason;
