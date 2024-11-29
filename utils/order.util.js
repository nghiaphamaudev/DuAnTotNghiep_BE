import Product from '../models/product.model';
import mongoose from 'mongoose';
import AppError from './appError.util';
import { StatusCodes } from 'http-status-codes';
import Voucher from '../models/voucher.model';

export async function RollbackQuantityProduct(
  orderItems,
  next,
  isCancel = false
) {
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

      const updateOperation = isCancel
        ? {
            $inc: {
              'variants.$[variant].sizes.$[size].inventory': item.quantity,
            },
          }
        : {
            $inc: {
              'variants.$[variant].sizes.$[size].inventory': -item.quantity,
            },
          };

      const result = await Product.updateOne(
        {
          _id: item.productId,
          'variants._id': item.variantId,
          'variants.sizes._id': item.sizeId,
        },
        updateOperation,
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

      if (result.modifiedCount === 0) {
        throw new AppError(
          `Không thể cập nhật tồn kho cho sản phẩm với ID: ${item.productId}, màu: ${item.variantId}, size: ${item.sizeId}.`,
          StatusCodes.BAD_REQUEST
        );
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error; // Ném lỗi để dừng quá trình
  } finally {
    session.endSession();
  }
}

/**
 * Rollback lại số lượng sản phẩm trong kho khi hủy đơn hàng
 * @param orderItems Danh sách sản phẩm trong đơn hàng
 * @param next Middleware tiếp theo
 */
export async function RollbackInventoryOnCancel(orderItems) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of orderItems) {
      // Cộng lại số lượng sản phẩm đã đặt vào kho
      const result = await Product.updateOne(
        {
          _id: item.productId,
          'variants._id': item.variantId,
          'variants.sizes._id': item.sizeId,
        },
        {
          $inc: {
            'variants.$[variant].sizes.$[size].inventory': item.quantity,
          },
        },
        {
          session,
          arrayFilters: [
            { 'variant._id': item.variantId },
            { 'size._id': item.sizeId }, // Không cần kiểm tra inventory
          ],
        }
      );

      if (result.modifiedCount === 0) {
        throw new AppError(
          `Không thể rollback tồn kho cho sản phẩm với ID: ${item.productId}, màu: ${item.variantId}, size: ${item.sizeId}.`,
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
export const rollbackVoucherOnCancel = async (discountCode, next) => {
  try {
    const voucher = await Voucher.findOne({ code: discountCode });
    if (voucher) {
      voucher.quantity += 1;
      voucher.usedCount -= 1;
      await voucher.save();
    }
  } catch (error) {
    return next(
      new AppError(
        'Không thể rollback số lượng voucher.',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
};
