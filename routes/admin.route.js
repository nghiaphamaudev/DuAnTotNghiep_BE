import express from 'express';
import {
  getAllAdminsAndSuperAdmins,
  getAllUserAccounts,
  blockedAccBySuperAdmin,
  createAccBySuperAdmin,
  loginAdmin,
  updateAccountAdmin,
  blockedUserAccBySuperAdmin,
} from '../controllers/superAdmin.controller';

const adminRouter = express.Router({ mergeParams: true });
adminRouter.get('/manage-account', getAllAdminsAndSuperAdmins);
adminRouter.get('/users', getAllUserAccounts);
adminRouter.post('/create-account', createAccBySuperAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.patch('/update-infor-admin/:idAdmin', updateAccountAdmin);
adminRouter.patch('/blocked-account/:idAdmin', blockedAccBySuperAdmin);
adminRouter.patch('/blocked-account-user/:idUser', blockedUserAccBySuperAdmin);

export default adminRouter;
