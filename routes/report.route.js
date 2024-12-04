import { Router } from 'express';
import {
  createReport,
  handleAdminReport,
} from '../controllers/report.controller';

const reportRouter = Router();

reportRouter.post('/', createReport);
reportRouter.patch('/:idReport', handleAdminReport);

export default reportRouter;
