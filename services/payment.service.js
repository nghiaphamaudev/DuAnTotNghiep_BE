import crypto from 'crypto';
import dotenv from 'dotenv';
import dateFormat from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import moment from 'moment/moment';

import querystring from 'qs';
import config from 'config';
import Order from '../models/order.model';
import { StatusCodes } from 'http-status-codes';
import HistoryTransaction from '../models/historyTransaction.model';
import Voucher from '../models/voucher.model';
import { RollbackInventoryOnCancel } from '../utils/order.util';
import { sendMailRefundCash } from '../services/email.service';
import AppError from '../utils/appError.util';
import User from '../models/user.model';

dotenv.config();

const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_SECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL;
const vnp_refundUrl = process.env.VNP_URL_REFUND;
const vpn_IpnUrl = process.env.VPN_IPN_URL;

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj);
  keys.sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}
export const createPaymentUrl = (req, amount, orderId, orderDescription) => {
  let ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = vnp_TmnCode;
  let secretKey = vnp_HashSecret;
  let vnpUrl = vnp_Url;
  let returnUrl = vnp_ReturnUrl;
  // let ipnUrl = vpn_IpnUrl || 'http://localhost:5173/vnpay_ipn';

  let date = new Date();

  const createDate = dateFormat(date).format('YYYYMMDDHHmmss');
  const expiredDate = dateFormat(date).add(2, 'm').format('YYYYMMDDHHmmss');

  let bankCode = '';

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderDescription;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  // vnp_Params['vnp_IpnUrl'] = ipnUrl;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expiredDate;

  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = Object.entries(vnp_Params)
    .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
    .reduce((result, item) => {
      if (item[1] !== undefined && item[1] !== null) {
        result = {
          ...result,
          [item[0]]: encodeURIComponent(item[1].toString().replace(/ /g, '+')),
        };
      }
      return result;
    }, {});

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
  return vnpUrl;
};

export const processVnpayPaymentResponse = async (req, res, next) => {
  var vnp_Params = req.query;
  var secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  var secretKey = config.get('vnp_HashSecret');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    var orderId = vnp_Params['vnp_TxnRef'];
    var rspCode = vnp_Params['vnp_ResponseCode'];

    if (rspCode === '00') {
      // Giao dịch thành công
      await Order.findOneAndUpdate(
        { code: orderId },
        { statusPayment: 'Đã thanh toán' }
      );
    } else {
      // Giao dịch thất bại
    }

    res.status(200).json({ RspCode: '00', Message: 'success' });
  } else {
    res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
  }
};

// Hàm này (/vnpay_return) là một endpoint dùng để xử lý thông báo từ VNPAY sau khi thanh toán đã được thực hiện. Đây là nơi VNPAY gửi thông tin phản hồi về kết quả giao dịch đến hệ thống của bạn, và bạn sẽ cần phải kiểm tra tính hợp lệ của dữ liệu và sau đó thông báo kết quả cho người dùng.

export const paymentRedirect = async (req, res, next) => {
  var vnp_Params = req.query;
  var secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  var tmnCode = vnp_TmnCode;
  var secretKey = vnp_HashSecret;

  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (vnp_Params['vnp_TransactionStatus'] === '00') {
    console.log(vnp_Params);
    await Order.updateOne(
      { _id: vnp_Params['vnp_TxnRef'] },
      {
        statusPayment: 'Đã thanh toán',
      }
    );
    const totalMoney = vnp_Params['vnp_Amount'] * 0.01;

    const historyTransaction = new HistoryTransaction({
      idUser: req.user.id,
      transactionVnPayId: vnp_Params['vnp_TransactionNo'],
      transactionVnPayDate: vnp_Params['vnp_PayDate'],
      idBill: vnp_Params['vnp_TxnRef'],
      type: 'Chuyển khoản',
      totalMoney: totalMoney,
      note: '',
    });
    await historyTransaction.save();
  } else {
    const updatedOrder = await Order.updateOne(
      { _id: vnp_Params['vnp_TxnRef'] },
      { status: 'Đã hủy' }
    );
    updatedOrder.status = status;
    await updatedOrder.save();
    await RollbackInventoryOnCancel(updatedOrder.orderItems);

    if (updatedOrder.discountCode) {
      const voucher = await Voucher.findOne({
        code: updatedOrder.discountCode,
      });

      if (voucher) {
        voucher.usedCount -= 1;
        voucher.quantity += 1; // Giảm số lượng đã sử dụng
        await voucher.save();
      }
    }
  }
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Success',
  });
};
function generateRequestId() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Các ký tự có thể dùng
  const length = Math.floor(Math.random() * 16) + 1; // Tạo chiều dài ngẫu nhiên từ 1 đến 32
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length)); // Chọn ký tự ngẫu nhiên
  }
  return result;
}
function formatDateTime(dateString) {
  // Tách chuỗi thành từng phần
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  const hour = dateString.slice(8, 10);
  const minute = dateString.slice(10, 12);
  const second = dateString.slice(12, 14);

  // Tạo đối tượng Date
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);

  // Format ngày giờ thân thiện
  return date.toLocaleString('vi-VN', {
    weekday: 'long', // Hiển thị thứ
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const refundTransaction = async (
  req,
  res,
  userId,
  transactionId,
  amount,
  orderId,
  transactionDate,
  refundReason
) => {
  try {
    const tmnCode = process.env.VNP_TMNCODE; // Mã TmnCode từ VNPAY
    const secretKey = process.env.VNP_SECRET; // Secret key từ VNPAY
    const vnpUrl =
      'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

    const requestId = generateRequestId(); // Tạo mã yêu cầu duy nhất
    const createDate = dayjs().format('YYYYMMDDHHmmss'); // Ngày giờ hiện tại
    let ipAddr =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    // Kiểm tra dữ liệu đầu vào
    if (!transactionId || !amount || !orderId) {
      throw new Error('Thiếu dữ liệu yêu cầu bắt buộc!');
    }

    // Tạo tham số yêu cầu
    const vnp_Params = {
      vnp_RequestId: requestId,
      vnp_Version: '2.1.0',
      vnp_Command: 'refund',
      vnp_TmnCode: tmnCode,
      vnp_TransactionType: '02',
      vnp_TxnRef: orderId,
      vnp_Amount: amount * 100, // Nhân 100 theo yêu cầu API
      vnp_TransactionNo: parseInt(transactionId),
      vnp_TransactionDate: parseInt(transactionDate), // Thời gian giao dịch gốc
      vnp_CreateDate: parseInt(createDate),
      vnp_CreateBy: 'Admin',
      vnp_IpAddr: ipAddr,
      vnp_OrderInfo: refundReason || 'Refund transaction',
    };

    // Tạo chuỗi dữ liệu để mã hóa
    const data = [
      vnp_Params.vnp_RequestId,
      vnp_Params.vnp_Version,
      vnp_Params.vnp_Command,
      vnp_Params.vnp_TmnCode,
      vnp_Params.vnp_TransactionType,
      vnp_Params.vnp_TxnRef,
      vnp_Params.vnp_Amount,
      vnp_Params.vnp_TransactionNo,
      vnp_Params.vnp_TransactionDate,
      vnp_Params.vnp_CreateBy,
      vnp_Params.vnp_CreateDate,
      vnp_Params.vnp_IpAddr,
      vnp_Params.vnp_OrderInfo,
    ].join('|');

    // Tạo checksum
    const hmac = crypto.createHmac('sha512', secretKey);
    const checksum = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = checksum;

    // Gửi yêu cầu HTTP POST
    const response = await axios.post(vnpUrl, vnp_Params, {
      headers: { 'Content-Type': 'Application/json' },
    });

    // Kiểm tra phản hồi
    if (response.data.vnp_ResponseCode === '00') {
      const historyTransaction = new HistoryTransaction({
        idUser: userId,
        transactionVnPayId: response.data.vnp_TransactionNo,
        transactionVnPayDate: response.data.vnp_PayDate,
        idBill: orderId,
        type: 'Chuyển khoản',
        totalMoney: response.data.vnp_Amount * 0.01,
        refundStatus: 'Chờ duyệt',
        refundDetails: {
          transactionType: 'Hoàn tiền toàn phần',
          refundAmount: response.data.vnp_Amount * 0.01,
          refundDate: formatDateTime(response.data.vnp_PayDate),
          bankCode: response.data.vnp_BankCode,
        },
      });
      await historyTransaction.save();
      const user = await User.findOne({ _id: userId });
      await sendMailRefundCash(
        'phamnghia19022002@gmail.com',
        user.fullName,
        response.data.vnp_TransactionNo,
        formatDateTime(response.data.vnp_PayDate),
        response.data.vnp_Amount * 0.01
      );

      console.log('Gửi yêu cầu thành công!');
    } else {
      console.log('Hoàn tiền thất bại:', response.data);
    }
  } catch (error) {
    console.log(error);
    console.error('Lỗi hoàn tiền:', error.message);
    throw new Error(error);
  }
};
