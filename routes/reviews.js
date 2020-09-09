const express = require('express');
const { protect, authorize } = require('../middlewares/auth');

const advancedResult = require('../middlewares/advancedResult');
const Review = require('../models/Reviews');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');
const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(
    advancedResult(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);
router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);
module.exports = router;
