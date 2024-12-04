import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import {
  templateConfirmOrder1,
  templateConfirmOrder2,
} from '../constants/confirmOrder.constants';
dotenv.config();
// Tạo transporter
const transporter = nodemailer.createTransport({
  secure: false,
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USERNAME, // địa chỉ email của bạn
    pass: process.env.EMAIL_PASSWORD, // mật khẩu ứng dụng của email
  },
});

// Hàm gửi email
export const sendMailServiceForgotPassword = async (to, subject, link) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // địa chỉ email người gửi
      to: to, // địa chỉ email người nhận
      subject: subject, // tiêu đề email // nội dung email
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #333;">Cài Đặt Mật Khẩu</h2>
            <p>Xin chào,</p>
            <p>Để đặt lại mật khẩu của bạn, vui lòng nhấp vào liên kết bên dưới:</p>
            <a href="${link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
          </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(link);
    console.log('Email đã được gửi:', info.response);
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};
export const sendMailServiceConfirmOrder = async (
  orderId,
  orderDate,
  totalPrice,
  products,
  totalCost,
  discountVoucher,
  shippingCost,
  to,
  title,
  receiver,
  phoneNumber,
  address
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // địa chỉ email người gửi
      to: to, // địa chỉ email người nhận
      subject: title, // tiêu đề email // nội dung email
      // html: templateConfirmOrder1(
      //   nameUser,
      //   orderId,
      //   orderDate,
      //   totalPrice,
      //   products
      // ),
      html: templateConfirmOrder2(
        orderId,
        orderDate,
        totalPrice,
        products,
        totalCost,
        discountVoucher,
        shippingCost,
        receiver,
        phoneNumber,
        address
      ),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi:', info.response);
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};

export const sendMaiBlockedOrder = async (to, subject, nameUser, note) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // địa chỉ email người gửi
      to: to, // địa chỉ email người nhận
      subject: subject, // tiêu đề email // nội dung email
      html: `
          <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Locked</title>
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #ff4d4d;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
      color: #333333;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 10px;
    }
    .footer {
      background-color: #f4f4f4;
      color: #666666;
      text-align: center;
      padding: 10px;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      background-color: #ff4d4d;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
    }
    .button:hover {
      background-color: #cc0000;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Cảnh Báo: Tài Khoản Bị Khóa</h1>
    </div>
    <div class="content">
      <p>Xin chào ${nameUser},</p>
      <p>Chúng tôi muốn thông báo rằng tài khoản của bạn đã bị khóa do ${note}.</p>
      <p>Nếu bạn nghĩ rằng đây là một sai sót, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi để được giúp đỡ.</p>
      <a href="[link hỗ trợ]" class="button">Liên Hệ Hỗ Trợ</a>
      <p>Chúng tôi xin lỗi vì sự bất tiện này và cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
      <p>Trân trọng,</p>
      <p>Đội ngũ hỗ trợ</p>
    </div>
    <div class="footer">
      <p>© 2024 Công ty của bạn. Mọi quyền được bảo lưu.</p>
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
  </div>
</body>
</html>

        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi:', info.response);
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};

export const sendMailDelivered = async (
  user,
  subject,
  orderCode,
  orderDate,
  paymentMethod,
  totalOrderPrice
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // địa chỉ email người gửi
      to: user.email, // địa chỉ email người nhận
      subject: subject, // tiêu đề email // nội dung email
      html: `
          <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #007bff;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 20px;
      line-height: 1.6;
    }
    .email-body h2 {
      font-size: 20px;
      color: #007bff;
    }
    .order-details {
      margin: 20px 0;
      border-collapse: collapse;
      width: 100%;
    }
    .order-details th, .order-details td {
      text-align: left;
      padding: 8px;
      border: 1px solid #ddd;
    }
    .order-details th {
      background-color: #f8f9fa;
      color: #333;
    }
    .email-footer {
      background-color: #f8f9fa;
      text-align: center;
      padding: 15px;
      font-size: 14px;
      color: #666;
    }
    .email-footer a {
      color: #007bff;
      text-decoration: none;
    }
    .btn {
      display: inline-block;
      background-color: #007bff;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 16px;
    }
    .btn:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Xác nhận đơn hàng đã giao</h1>
    </div>
    <div class="email-body">
      <p>Xin chào <strong>${user.fullName}</strong>,</p>
      <p>Chúng tôi rất vui thông báo rằng đơn hàng của bạn đã được giao thành công.</p>
      <h2>Chi tiết đơn hàng</h2>
      <table class="order-details">
        <tr>
          <th>Mã đơn hàng</th>
          <td>${orderCode}</td>
        </tr>
        <tr>
          <th>Ngày đặt hàng</th>
          <td>${orderDate}</td>
        </tr>
        <tr>
          <th>Phương thức thanh toán</th>
          <td>${paymentMethod}</td>
        </tr>
        <tr>
          <th>Tổng tiền</th>
          <td>${totalOrderPrice}</td>
        </tr>
      </table>
      <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
      <p>
        <a href="[Đường dẫn đến trang đánh giá]" class="btn">Đánh giá sản phẩm</a>
      </p>
    </div>
    <div class="email-footer">
      <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi.</p>
      <p>Hotline: <a href="tel:+84123456789">+84 123 456 789</a></p>
      <p><a href="[Link website]" target="_blank">[Tên công ty]</a></p>
    </div>
  </div>
</body>
</html>

        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi:', info.response);
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};

export const sendMailRefundCash = async (
  to,
  userName,
  transactionId,
  transactionDate,
  refundAmount
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // địa chỉ email người gửi
      to: to, // địa chỉ email người nhận
      subject: 'Hoàn trả tiền', // tiêu đề email // nội dung email
      html: `
          <!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông báo hoàn tiền</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    h2 {
      color: #333;
      text-align: center;
    }
    p {
      color: #555;
      line-height: 1.6;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #888;
      margin-top: 20px;
    }
    .highlight {
      color: #28a745;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #28a745;
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
      text-align: center;
    }
    .button:hover {
      background-color: #218838;
    }
  </style>
</head>
<body>

  <div class="container">
    <h2>Thông báo hoàn tiền</h2>

    <p>Chào bạn <strong>${userName}</strong>,</p>

    <p>Chúng tôi muốn thông báo rằng yêu cầu hoàn tiền của bạn đang được xử lí. Sau khi xác minh giao dịch, số tiền <span class="highlight">${refundAmount} VNĐ</span> sẽ được hoàn lại vào phương thức thanh toán của bạn trong khoảng 1 - 2 ngày.</p>

    <p>Thông tin giao dịch hoàn tiền:</p>
    <ul>
      <li><strong>Mã giao dịch:</strong> ${transactionId}</li>
      <li><strong>Ngày giao dịch:</strong> ${transactionDate}</li>
      <li><strong>Phương thức thanh toán:</strong> Chuyển khoản NCB</li>
    </ul>

    <p>Chúng tôi hy vọng bạn sẽ tiếp tục sử dụng dịch vụ của chúng tôi. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ khách hàng.</p>

    <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.</p>

    <a href="{{supportLink}}" class="button">Liên hệ với chúng tôi</a>

    <div class="footer">
      <p>Trân trọng,<br>Đội ngũ hỗ trợ khách hàng</p>
    </div>
  </div>

</body>
</html>

        `,
    };
    await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi:');
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};
