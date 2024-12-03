import express from 'express';
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
adminRouter.patch('/update-password', updatePasswordManagement);
adminRouter.get('/get-me', getAdminById);
adminRouter.use(checkAdminRole('superadmin'));
adminRouter.get('/manage-account', getAllAdminsAndSuperAdmins);
adminRouter.get('/users', getAllUserAccounts);
adminRouter.patch('/update-infor-admin/:idAdmin', updateAccountAdmin);
adminRouter.patch('/blocked-account/:idAdmin', blockedAccBySuperAdmin);
adminRouter.patch('/blocked-account-user/:idUser', blockedUserAccBySuperAdmin);

export default adminRouter;
