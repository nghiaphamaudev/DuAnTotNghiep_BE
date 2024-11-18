import crypto from 'crypto';
import dotenv from 'dotenv';
import dateFormat from 'dayjs';
import dayjs from 'dayjs';
import querystring from 'qs';
import config from 'config';
import Order from '../models/order.model';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_SECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL;
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
  console.log(req.query);
  var secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  var secretKey = config.get('vnp_HashSecret');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  console.log({ secureHash, signed });

  if (secureHash === signed) {
    var orderId = vnp_Params['vnp_TxnRef'];
    var rspCode = vnp_Params['vnp_ResponseCode'];
    console.log(orderId);
    if (rspCode === '00') {
      // Giao dịch thành công
      await Order.findOneAndUpdate(
        { code: orderId },
        { statusPayment: 'Đã thanh toán' }
      );
    } else {
      // Giao dịch thất bại
      await Order.findOneAndUpdate(
        { code: orderId },
        { statusPayment: 'Thanh toán thất bại' }
      );
    }

    res.status(200).json({ RspCode: '00', Message: 'success' });
  } else {
    res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
  }
};

// Hàm này (/vnpay_return) là một endpoint dùng để xử lý thông báo từ VNPAY sau khi thanh toán đã được thực hiện. Đây là nơi VNPAY gửi thông tin phản hồi về kết quả giao dịch đến hệ thống của bạn, và bạn sẽ cần phải kiểm tra tính hợp lệ của dữ liệu và sau đó thông báo kết quả cho người dùng.

export const paymentRedirect = (req, res, next) => {
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
  console.log('Sign Data: ', signData);
  console.log('Secure Hash: ', secureHash);
  console.log('Signed Hash: ', signed);
  if (vnp_Params['vnp_TransactionStatus'] === '00') {
    console.log('Cập nhật đơn hàng!');
  } else {
    console.log('Đơn hàng bị hủy');
  }
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Success',
  });
};
