import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import slugify from 'slugify';

const sizeSchema = new mongoose.Schema(
  {
    nameSize: { type: String, required: true },
    price: { type: Number, required: true },
    inventory: { type: Number, required: true, min: 0 },
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
    },
  } // Tắt _id trong sizeSchema
);

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true },
    images: [String],
    sizes: [sizeSchema],
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
    },
  } // Tắt _id trong variantSchema
);

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
      type: Boolean,
      default: true,
    },
    slug: { type: String, unique: true, required: true },
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
    },
    versionKey: false,
    timestamps: true,
  }
);

// Tạo trường ảo "id" thay cho "_id"
productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);
export default Product;
