import { Router } from 'express';

import {
  addVoucher,
  deleteVoucher,
  getVouchers,
  updateVoucher,
} from '../controllers/voucher.controller';

const voucherRouter = Router();

voucherRouter.post('/', addVoucher);
voucherRouter.delete('/:id', deleteVoucher);
voucherRouter.get('/', getVouchers);
voucherRouter.patch('/:id', updateVoucher);

export default voucherRouter;
