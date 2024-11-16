import crypto from 'crypto';
import dotenv from 'dotenv';
import dateFormat from 'dayjs';
import dayjs from 'dayjs';
import querystring from 'qs';
import config from 'config';

dotenv.config();

const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_SECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj);
  keys.sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}
export const createPaymentUrl = (req, res, next) => {
  let ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = vnp_TmnCode;
  let secretKey = vnp_HashSecret;
  let vnpUrl = vnp_Url;
  let returnUrl = vnp_ReturnUrl;

  let date = new Date();

  const createDate = dateFormat(date).format('YYYYMMDDHHmmss');
  const expiredDate = dateFormat(date).add(2, 'm').format('YYYYMMDDHHmmss');

  let orderId = req.body.orderId;
  let amount = req.body.amount;
  let bankCode = req.body.bankCode;

  let orderInfo = req.body.orderDescription;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
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
        // Kiểm tra giá trị hợp lệ
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
  console.log(vnpUrl);
  res.redirect(vnpUrl);
};

export const processVnpayPaymentResponse = (req, res, next) => {
  var vnp_Params = req.query;
  var secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  var secretKey = config.get('vnp_HashSecret');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    var orderId = vnp_Params['vnp_TxnRef'];
    var rspCode = vnp_Params['vnp_ResponseCode'];
    //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
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

  var tmnCode = config.get('vnp_TmnCode');
  var secretKey = config.get('vnp_HashSecret');

  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

    res.render('success', { code: vnp_Params['vnp_ResponseCode'] });
  } else {
    res.render('success', { code: '97' });
  }
};
