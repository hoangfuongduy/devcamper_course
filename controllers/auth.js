const crypto = require('crypto');

const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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
  await user.save({ validateBeforeSave: false });
  // send mail with the token;
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `Click this link ${resetUrl}`;
  try {
    await sendEmail({ email: user.email, subject: 'Password reset', message });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
};

// reset password -*/*- PUT -*/*- api/v1/auth/resetpassword/:resettoken -*/*- public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }
  // set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// update user infor -*/*- PUT -*/*- api/v1/auth/updatedetails -*/*- private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = { name: req.body.name, email: req.body.email };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

// update password -*/*- PUT -*/*- api/v1/auth/updatepassword -*/*- private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  // check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Current password incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// log out && clear cookies -*/*- GET -*/*- api/v1/auth/logout -*/*- private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out' });
});

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
