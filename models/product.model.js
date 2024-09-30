import mongoose from 'mongoose';
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A category must to have a name !'],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
    },
    coverImg: {
      type: String,
      required: [true, 'A product must have a image'],
    },
    ratingAverage: {
      type: Number,
      require: false,
      default: 0,
    },
    variants: [
      {
        color: {
          type: String,
          required: true,
        },
        images: [String],
        sizes: [
          {
            nameSize: {
              type: String,
              required: true,
            },
            price: {
              type: Number,
              required: true,
            },
            inventory: {
              type: Number,
              required: true,
              min: 0,
            },
          },
        ],
      },
    ],

    ratingQuantity: {
      type: Number,
      required: false,
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'A product must have a description'],
    },
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

const Product = mongoose.model('Product', productSchema);
export default Product;
