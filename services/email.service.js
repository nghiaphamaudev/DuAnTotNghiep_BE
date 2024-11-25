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
  nameUser,
  orderId,
  orderDate,
  totalPrice,
  products,
  to,
  title,
  receiver,
  phoneNumber,
  address
) => {
  try {
    console.log(products);
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
