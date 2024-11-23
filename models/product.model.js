import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import slugify from 'slugify';

const sizeSchema = new mongoose.Schema(
  {
    nameSize: { type: String, required: true },
    price: { type: Number, required: true },
    inventory: { type: Number, required: true, min: 0 },
    status: {
      type: Boolean,
      required: true, // Đảm bảo trường status luôn có giá trị
      default: function () {
        return this.inventory >= 0; // Nếu inventory > 0 thì status là true, nếu không thì false
      },
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
    status: {
      type: Boolean,
      default: function () {
        // Kiểm tra tất cả size trong variant có hết hàng không
        return this.sizes.some((size) => size.status === true); // Chỉ cần một size có status là true
      },
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
    },
  }
);

// Hook pre-save để cập nhật status của variant dựa trên sizes
variantSchema.pre('save', function (next) {
  this.status = this.sizes.some((size) => size.status === true); // Nếu có size nào có status = true thì variant status = true
  next();
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
