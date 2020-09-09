const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');

// get all users -*/*- GET -*/*- api/v1/users/ -*/*- private/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});
// get single user -*/*- GET -*/*- api/v1/users/:id -*/*- private/admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

// create user -*/*- POST -*/*- api/v1/users/ -*/*- private/admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});
// update user -*/*- PUT -*/*- api/v1/users/:id -*/*- private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});
// delete user -*/*- DELETE -*/*- api/v1/users/:id -*/*- private/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted user' });
});
