################### Github#####################

1. Ví dụ về commit

# ex1:

feat: implement multi-languages

# ex2:

fix: homepage's bug

# ex3 with scope:

fix(player): uiza player can not initialize

2.

# feat: thêm một feature

# fix: fix bug cho hệ thống

# refactor: sửa code nhưng không fix bug cũng không thêm feature hoặc đôi khi bug cũng được fix từ việc refactor.

# docs: thêm/thay đổi document

# chore: những sửa đổi nhỏ nhặt không liên quan tới code

# style: những thay đổi không làm thay đổi ý nghĩa của code như thay đổi css/ui chẳng hạn.

# perf: code cải tiến về mặt hiệu năng xử lý

# vendor: cập nhật version cho các dependencies, packages.

BE/
├── config/ # Cấu hình môi trường, database, v.v.
│ └── db.js # Cấu hình kết nối cơ sở dữ liệu (MongoDB)
├── controllers/ # Chứa logic xử lý của các route
│ └── authController.js # Controller cho authentication
│ └── userController.js # Controller cho người dùng
├── middlewares/ # Chứa các middleware như xác thực, xử lý lỗi
│ └── authMiddleware.js # Middleware để kiểm tra token JWT
│ └── errorHandler.js # Xử lý lỗi toàn cục
├── models/ # Chứa các schema của MongoDB
│ └── User.js # Mô hình (schema) cho người dùng
├── routes/ # Định nghĩa các route
│ └── authRoutes.js # Các route cho authentication
│ └── userRoutes.js # Các route cho người dùng
├── services/ # Chứa các dịch vụ tái sử dụng (gửi email, thông báo, v.v.)
│ └── emailService.js # Dịch vụ gửi email
├── utils/ # Chứa các hàm tiện ích
│ └── validators.js # Hàm validate dữ liệu
│ └── helpers.js # Các helper chung
├── .env # Biến môi trường
├── .gitignore # Các file/thư mục bị bỏ qua bởi Git
├── package.json # File cấu hình npm (thông tin về dự án và dependencies)
└── app.js # Dùng để quản lí sử dụng các middleware, routes
├── server.js # Điểm vào của ứng dụng (nơi khởi động server)
└── README.md # Hướng dẫn sử dụng dự án
