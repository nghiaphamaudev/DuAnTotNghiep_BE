import Product from '../models/product.model';
import mongoose from 'mongoose';
import AppError from './appError.util';
import { StatusCodes } from 'http-status-codes';
export async function RollbackQuantityProduct(orderItems, next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of orderItems) {
      const product = await Product.findOne({
        _id: item.productId,
        variants: {
          $elemMatch: {
            _id: item.variantId,
            sizes: {
              $elemMatch: {
                _id: item.sizeId,
                inventory: { $gte: item.quantity },
              },
            },
          },
        },
      }).session(session);

      if (!product) {
        throw new AppError(
          'Một số sản phẩm đã hết hàng vui lòng thực hiện lại.',
          StatusCodes.BAD_REQUEST
        );
      }

      const result = await Product.updateOne(
        {
          _id: item.productId,
          'variants._id': item.variantId,
          'variants.sizes._id': item.sizeId,
        },
        {
          $inc: {
            'variants.$[variant].sizes.$[size].inventory': -item.quantity,
          },
        },
        {
          session,
          arrayFilters: [
            { 'variant._id': item.variantId },
            {
              'size._id': item.sizeId,
              'size.inventory': { $gte: item.quantity },
            },
          ],
        }
      );

      console.log('Update result:', result);
      if (result.modifiedCount === 0) {
        throw new AppError(
          `Không thể trừ tồn kho cho sản phẩm với ID: ${item.productId}, màu: ${item.variantId}, size: ${item.sizeId}.`,
          StatusCodes.BAD_REQUEST
        );
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
}
