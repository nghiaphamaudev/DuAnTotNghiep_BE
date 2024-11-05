import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import slugify from 'slugify';

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
    slug: { type: String, unique: true, required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.plugin(mongoosePaginate);
const Product = mongoose.model('Product', productSchema);
export default Product;
