import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const sizeSchema = new mongoose.Schema({
  nameSize: { type: String, required: true },
  price: { type: Number, required: true },
  inventory: { type: Number, required: true, min: 0 },
});

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  images: [String],
  sizes: [sizeSchema],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    category: { type: mongoose.Schema.ObjectId, ref: 'Category' },
    coverImg: { type: String, required: true },
    ratingAverage: { type: Number, default: 0 },
    variants: [variantSchema],
    ratingQuantity: { type: Number, default: 0 },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['Available', 'OutOfStock', 'Disabled'],
      default: 'Available',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);
productSchema.plugin(mongoosePaginate);
const Product = mongoose.model('Product', productSchema);
export default Product;
