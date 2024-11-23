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
