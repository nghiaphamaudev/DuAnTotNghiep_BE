
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
  }
);

// Hook pre-save để cập nhật `status` dựa trên `inventory`
sizeSchema.pre('save', function (next) {
  this.status = this.inventory >= 0; // Nếu inventory > 0, status là true
  next();
});

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true },
    images: [String],
    imageFiles: [String],
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
  }
);

// Hook pre-save để cập nhật status của variant dựa trên sizes

const productSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    category: { type: mongoose.Schema.ObjectId, ref: 'Category' },
    coverImg: { type: String, required: true },
    ratingAverage: { type: Number, default: 0 },
    variants: [variantSchema],
    orderQuantity: { type: Number, default: 0 },
    ratingQuantity: { type: Number, default: 0 },
    description: { type: String, required: true },
    saleCount: { type: Number, default: 0 },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: { type: String },
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
