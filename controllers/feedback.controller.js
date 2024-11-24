import Feedback from "../models/feedback.model";
import catchAsync from '../utils/catchAsync.util';
import AppError from "../utils/appError.util";

export const addFeedback = catchAsync(async (req, res, next) => {
    const { productId, classify, rating, comment } = req.body;
    const user = req.user;

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
        return next(new AppError('Bạn cần đăng nhập để gửi phản hồi.', 401));
    }

    // Tiến hành thêm phản hồi
    const feedback = await Feedback.create({
        user: user._id, // ID của người dùng đã xác thực
        productId,
        classify,
        rating,
        comment: comment || '',
        images: req.files['images'] ? req.files['images'].map(file => file.path) : [],
    });

    // Populate thêm thông tin chi tiết của người dùng và sản phẩm
    const populatedFeedback = await Feedback.findById(feedback._id)
        .populate('user', 'fullName avatar')
        .populate('productId', 'name coverImg');
    res.status(201).json({
        status: 'success',
        data: {
            feedback: populatedFeedback,
        },
    });
});

export const getAllFeedbacksByProduct = catchAsync(async (req, res) => {
    const { productId } = req.params;

    const feedbacks = await Feedback.find({ productId })
        .populate('user', 'name avatar')
        .populate('productId', 'name coverImage');

    if (feedbacks.length === 0) {
        return res.status(404).json({
            status: 'fail',
            message: 'No feedback found for this product.',
        });
    }

    res.status(200).json({
        status: 'success',
        results: feedbacks.length,
        data: {
            feedbacks,
        },
    });
});


export const deleteFeedback = catchAsync(async (req, res, next) => {
    const { feedbackId } = req.params;

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user) {
        return next(new AppError('You need to be logged in to delete feedback.', 401));
    }

    // Tìm bình luận theo feedbackId và populate thông tin người dùng
    const feedback = await Feedback.findById(feedbackId).populate('user');

    // Kiểm tra xem bình luận có tồn tại không
    if (!feedback) {
        return next(new AppError('Feedback not found!', 404));
    }

    // Kiểm tra quyền truy cập: chỉ cho phép người dùng đã tạo bình luận mới được xóa
    if (feedback.user._id.toString() !== req.user._id.toString()) {
        return next(new AppError('You do not have permission to delete this feedback.', 403));
    }

    // Xóa bình luận
    await Feedback.findByIdAndDelete(feedbackId);

    // Trả về thông báo thành công
    res.status(200).json({
        status: 'success',
        message: 'Feedback deleted successfully.',
    });
});


export const updateFeedback = catchAsync(async (req, res, next) => {
    const { feedbackId } = req.params;

    if (!req.user) {
        return next(new AppError('You need to be logged in to update feedback.', 401));
    }

    const feedback = await Feedback.findById(feedbackId).populate('user'); // Populate để lấy thông tin người dùng

    // Kiểm tra xem bình luận có tồn tại không
    if (!feedback) {
        return next(new AppError('Feedback not found!', 404));
    }

    // Kiểm tra quyền truy cập: chỉ cho phép người dùng đã tạo bình luận mới được cập nhật
    if (feedback.user._id.toString() !== req.user._id.toString()) {
        return next(new AppError('You do not have permission to update this feedback.', 403));
    }

    // Khởi tạo một đối tượng chứa các trường cập nhật
    const updateData = {
        classify: req.body.classify || feedback.classify, // Nếu không có, giữ nguyên giá trị cũ
        rating: req.body.rating || feedback.rating,
        comment: req.body.comment || feedback.comment,
        images: req.files['images'] ? req.files['images'].map(file => file.path) : feedback.images, // Cập nhật ảnh nếu có
    };

    // Cập nhật các trường cần thiết
    const updatedFeedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        updateData,
        { new: true }
    ).populate('user', 'name avatar')
        .populate('productId', 'name coverImage');

    res.status(200).json({
        status: 'success',
        data: {
            feedback: updatedFeedback,
        },
    });
});


export const toggleLikeFeedback = catchAsync(async (req, res, next) => {
    const { feedbackId } = req.params;

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user) {
        return next(new AppError('You need to be logged in to like feedback.', 401));
    }

    // Tìm bình luận theo feedbackId
    const feedback = await Feedback.findById(feedbackId);

    // Kiểm tra xem bình luận có tồn tại không
    if (!feedback) {
        return next(new AppError('Feedback not found!', 404));
    }

    const userId = req.user._id;

    // Kiểm tra xem người dùng đã like chưa
    const hasLiked = feedback.likedBy.includes(userId);

    if (hasLiked) {
        // Nếu đã like, trừ lượt like và xóa user khỏi danh sách likedBy
        feedback.like -= 1;
        feedback.likedBy = feedback.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
        // Nếu chưa like, tăng lượt like và thêm user vào danh sách likedBy
        feedback.like += 1;
        feedback.likedBy.push(userId);
    }

    // Cập nhật bình luận
    await feedback.save();

    // Populate thông tin người đã like
    const populatedFeedback = await Feedback.findById(feedbackId)
        .populate('user', 'fullName avatar')
        .populate('likedBy', 'fullName avatar');

    res.status(200).json({
        status: 'success',
        data: {
            feedback: populatedFeedback,
        },
    });
});
