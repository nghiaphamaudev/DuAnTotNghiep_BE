import express from 'express';
import {
  getAllOrder,
  getOrderDetailByUser,
  updateStatusOrderByAdmin,
  getAllOrderByRange,
} from '../controllers/order.controller';
import {
  getAllAdminsAndSuperAdmins,
  getAllUserAccounts,
  blockedAccBySuperAdmin,
  createAccBySuperAdmin,
  loginAdmin,
  updateAccountAdmin,
  blockedUserAccBySuperAdmin,
  updatePasswordManagement,
  getAdminById,
  getOrderStatistics,
  updatePaymentRestriction,
  getAllOrderByUserId,
  getAllOrderWithAccountAdmin,
} from '../controllers/superAdmin.controller';
import {
  protectAdmin,
  checkAdminRole,
} from '../middlewares/checkRole.middeleware';

const adminRouter = express.Router({ mergeParams: true });

adminRouter.post('/login', loginAdmin);

adminRouter.post('/create-account', createAccBySuperAdmin);

//Middleware check đăng nhập ,quyền truy cập tài nguyên
adminRouter.use(protectAdmin);

//cập nhật mật khẩu superadmi, admin (tự cập nhật)
adminRouter.patch('/update-password', updatePasswordManagement);
//lấy thong tin superadmin, admin
adminRouter.get('/get-me', getAdminById);
// middleware check quyền

// adminRouter.use(checkAdminRole('superadmin'));

//lấy all tài khoản supeadmin, admin

adminRouter.get('/manage-account', getAllAdminsAndSuperAdmins);

//lấy all tài khoản user
adminRouter.get('/users', getAllUserAccounts);
//Cập  nhật mật khẩu do superadmin cập nhật cho admin
adminRouter.patch('/update-infor-admin/:idAdmin', updateAccountAdmin);
//block tài khoản admin
adminRouter.patch('/blocked-account/:idAdmin', blockedAccBySuperAdmin);
// block tài khoản user
adminRouter.patch('/blocked-account-user/:idUser', blockedUserAccBySuperAdmin);
//Thông số báo cáo tỉ lẹ đơn đặt hàng của user
adminRouter.get('/orders/user/:userId/statistics', getOrderStatistics);
//Lấy tất cả đơn hàng của user
adminRouter.get('/orders/user/:userId', getAllOrderByUserId);
//cập nhật trạng thái yêu cầu thanh toán trước
adminRouter.patch(
  '/user/:userId/payment-restriction',
  updatePaymentRestriction
);

adminRouter.get('/orders/admin', getAllOrderWithAccountAdmin);

adminRouter.get('/bill/:orderId', getOrderDetailByUser);
adminRouter.patch('/update-order-admin', updateStatusOrderByAdmin);
adminRouter.get('/all-order', getAllOrder);
adminRouter.get('/all-order/range', getAllOrderByRange);

export default adminRouter;
