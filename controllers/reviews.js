const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Review = require('../models/Reviews');
const Bootcamp = require('../models/Bootcamp');

// GET
// api/v1/reviews -- get all reviews
// api/v1/bootcamps/:bootcampId/reviews
// public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } else {
    res.status(200).json(res.advancedResult);
  }
});
// GET
// api/v1/reviews/:id -- get single review
// public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  console.log(review);
  if (!review) {
    return next(new ErrorResponse('Cannot find the result', 404));
  }
  res.status(200).json({ success: true, data: review });
});
// POST
// api/v1/bootcamps/:bootcampId/reviews -- add review
// private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new ErrorResponse('Bootcamp not found', 404));
  }
  const review = await Review.create(req.body);
  res.status(201).json({ success: true, data: review });
});
// PUT
// api/v1/reviews/:id -- update review
// private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }
  // check owner
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Unauthorized', 401));
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({ success: true, data: review });
});
// DELETE
// api/v1/reviews/:id -- delete review
// private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }
  // check owner
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Unauthorized', 401));
  }
  await review.remove();
  res.status(201).json({ success: true, message: 'Review removed' });
});
