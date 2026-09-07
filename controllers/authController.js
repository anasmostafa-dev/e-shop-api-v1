const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");

// @route  : POST /api/v1/auth/signup
// @desc   : signup user
// @access : public
exports.signup = asyncHandler(async (req, res, next) => {
  const user = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = generateToken(user._id);

  res.status(201).json({ data: user, token });
});

// @route  : POST /api/v1/auth/login
// @desc   : login user
// @access : public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if email is exist (validation layer)
  // 2- // check if password an email is correct
  const user = await userModel.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc   : protectd route (authenticated)
exports.protect = asyncHandler(async (req, res, next) => {
  // 1- token is exist? if exist=> get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in, Please login to get access this route",
        401,
      ),
    );
  }

  // 2- verify token (no change happens, expires time)

  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  // 3- check if user is exist
  const currentUser = await userModel.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token no longer exists", 401),
    );
  }

  // 4- Check if user account is active?
  if (!currentUser.isActive) {
    return next(
      new ApiError("Your account is deactivated. Please contact support.", 401),
    );
  }

  // 4- check if user change password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedAtTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10,
    );
    if (passChangedAtTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "Your password has been changed. Please login again.",
          401,
        ),
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc   : Permisions/Roles for users
exports.allowedTo = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403),
      );
    }
    next();
  });
};

// @route  : POST /api/v1/auth/forgotPassword
// @desc   : forgot password for user
// @access : public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- check if email for user is exist
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(
        `No account is associated with this email: ${req.body.email}`,
        401,
      ),
    );
  }

  // 2- If user exist, generate 6 rendom digite, hash this 6 numbers and save this in DB
  const resetCode = crypto.randomInt(100000, 1000000).toString();
  const hashedResetCode = crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExpires = Date.now() + 5 * 60 * 1000;
  user.passwordResetCodeVerified = false;

  await user.save();

  // Html Design for message in gmail
  const htmlMessage = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
    
    <!-- Header / Brand -->
    <div style="text-align: center; margin-bottom: 25px;">
      <h1 style="color: #2c3e50; font-size: 26px; margin: 0; font-weight: 700;">E-Shop</h1>
    </div>

    <!-- Body Content -->
    <h2 style="color: #333333; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
    <p style="color: #555555; font-size: 15px; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
    <p style="color: #555555; font-size: 14px; line-height: 1.6;">We received a request to reset your E-Shop account password. Enter the code below to complete the reset:</p>

    <!-- OTP Code Box -->
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background-color: #f4f6f8; border: 2px dashed #007bff; padding: 14px 28px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007bff;">
        ${resetCode}
      </div>
    </div>

    <!-- Warnings & Expiry -->
    <p style="color: #888888; font-size: 13px; margin-bottom: 5px;">This code is valid for <strong>5 minutes</strong> only.</p>
    <p style="color: #888888; font-size: 13px; margin-top: 0;">If you didn't request a password reset, you can safely ignore this email.</p>

    <!-- Divider & Footer -->
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />
    
    <p style="color: #aaaaaa; font-size: 12px; text-align: center; margin: 0;">
      &copy; ${new Date().getFullYear()} E-Shop Team. All rights reserved.
    </p>
  </div>
`;

  // 3- send the reset code via email
  const message = `Hi ${user.name}\n We received a request to reset the password on your E-shop Account\n \n ${resetCode}\n\n Enter this code to complete the reset\n Thanks for helping us keep your account secure.\n\n the E-Shop Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 5 min)",
      message,
      html: htmlMessage,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetCodeVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code send to email" });
});

// @route  : POST /api/v1/auth/verifyPassword
// @desc   : verify password
// @access : public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // get user based on hashed password
  const hashedResetCode = crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(req.body.resetCode)
    .digest("hex");

  const user = await userModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Reset code invalid or expired", 400));
  }

  user.passwordResetCodeVerified = true;
  await user.save();

  res.status(200).json({ status: "Success" });
});

// @route  : POST /api/v1/auth/resetPassword
// @desc   : reset password
// @access : public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1- get user based on email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`Not found user for this email: ${req.body.email}`, 404),
    );
  }

  if (!user.passwordResetCodeVerified) {
    return next(new ApiError("Reset code has not been verified yet", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  user.passwordResetCodeVerified = undefined;

  await user.save();

  const token = generateToken(user._id);
  res.status(200).json({ token });
});
