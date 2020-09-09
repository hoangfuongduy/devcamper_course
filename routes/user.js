const express = require('express');

const {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  createUser,
} = require('../controllers/user');

const User = require('../models/User');
const router = express.Router({ mergeParams: true });
const advancedResults = require('../middlewares/advancedResult');
const { protect, authorize } = require('../middlewares/auth');
router.use(protect);
router.use(authorize('admin'));
router.route('/').get(advancedResults(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);
module.exports = router;
