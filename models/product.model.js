import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
    },
    coverImg: {
      type: String,
      required: true,
    },
    ratingAverage: {
      type: Number,
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
            discountedPrice: {
              type: Number,
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
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'OutOfStock', 'Disabled'],
      default: 'Available',
    },
  },
  {

    versionKey: false,
    timestamps: true,
  }
);

productSchema.plugin(mongoosePaginate);
const Product = mongoose.model('Product', productSchema);
export default Product;