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
      ref: 'CategorySeason',
    },
    coverImg: {
      type: String,
      required: true,
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
      required: true,
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
productSchema.plugin(mongoosePaginate);
const Product = mongoose.model('Product', productSchema);
export default Product;
