const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const { token } = require('morgan');

// register user -*/*- POST -*/*- api/v1/auth/register -*/*- public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  sendTokenResponse(user, 200, res);
});

// login user -*/*- POST -*/*- api/v1/auth/login -*/*- public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }
  // check user existed;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid credential', 401));
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credential', 401));
  }
  sendTokenResponse(user, 200, res);
});

// get current login user -*/*- POST -*/*- api/v1/auth/me -*/*- private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: user });
});

// forgot password -*/*- POST -*/*- api/v1/auth/forgotpassword -*/*- public
exports.forgotpassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('No user with the provided email', 404));
  }
  // generate token
  const resetToken = user.getResetPasswordToken();
  console.log(resetToken);
  res.status(200).json({ success: true, data: user });
};

/// put at the end
// Get token from Model, send cookie in response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};
