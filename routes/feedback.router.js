import { Router } from 'express';
import {
  addFeedback,
  deleteFeedback,
  getAllFeedbacksByProduct,
  toggleLikeFeedback,
  updateFeedback,
} from '../controllers/feedback.controller';
import { uploadFeedbackImages } from '../middlewares/uploadCloud.middleware';
import { protect } from '../controllers/auth.controller';

const feedbackRouter = Router();

feedbackRouter.post('/add', protect, uploadFeedbackImages, addFeedback);
feedbackRouter.get('/:productId', getAllFeedbacksByProduct);
feedbackRouter.delete('/:feedbackId', protect, deleteFeedback);
feedbackRouter.patch(
  '/:feedbackId',
  protect,
  uploadFeedbackImages,
  updateFeedback
);
feedbackRouter.patch('/:feedbackId/like', protect, toggleLikeFeedback);

export default feedbackRouter;
