import crypto from 'crypto';
import querystring from 'querystring';
import dotenv from 'dotenv';
dotenv.config();

const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_SECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

function createPaymentUrl(orderId, amount, orderInfo, ipAddr) {
  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'billpayment',
    vnp_Amount: amount, // Số tiền tính theo đơn vị VND nhân 100
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: new Date()
      .toISOString()
      .replace(/[-T:\.Z]/g, '')
      .slice(0, 14),
  };

  // Sắp xếp các tham số theo thứ tự alphabet
  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnp_Params.vnp_SecureHash = secureHash;
  const paymentUrl = `${vnp_Url}?${querystring.stringify(vnp_Params)}`;

  res.json({ paymentUrl });
}

export { createPaymentUrl };

const handleVnpayReturn = (req, res) => {
  const vnp_Params = req.query;

  // Tách vnp_SecureHash ra khỏi vnp_Params
  const secureHash = vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHash;

  // Sắp xếp và tạo chuỗi để kiểm tra tính hợp lệ
  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === checkSum) {
    if (vnp_Params.vnp_ResponseCode === '00') {
      // Thanh toán thành công
      res.json({ status: 'success', message: 'Thanh toán thành công' });
    } else {
      // Thanh toán thất bại
      res.json({ status: 'failed', message: 'Thanh toán thất bại' });
    }
  } else {
    // Xác thực không thành công
    res.json({ status: 'error', message: 'Chữ ký không hợp lệ' });
  }
};
export { handleVnpayReturn };
