const sharp = require("sharp");
// eslint-disable-next-line node/no-missing-require
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const factory = require("./factoryHandler");
const { uploadSingleImg } = require("../middlewares/uploadImageMiddleware");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/generateToken");

// upload single image
exports.uploadeUserImg = uploadSingleImg("image");

// image processing
exports.resizeImageUser = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // save img in DB
    req.body.image = filename;
  }

  next();
});

// @route  : GET /api/v1/users/
// @desc   : GET all users
// @access : Private/admin/manager
exports.getAllUsers = factory.getAll(userModel);

// @route  : GET /api/v1/users/:id
// @desc   : Get Specific user
// @access : Private/admin/manager
exports.getUser = factory.getOne(userModel);

// @route  : POST /api/v1/users/
// @desc   : Create user
// @access : Private/admin/manager
exports.createUser = factory.createOne(userModel);

// @route  : PUT /api/v1/users/:id
// @desc   : Update specific user
// @access : Private/admin/manager
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      image: req.body.image,
      role: req.body.role,
    },
    {
      new: true,
    },
  );
  if (!user) {
    return next(new ApiError(`No document for this id: ${id}`, 404));
  }

  res.status(200).json({ data: user });
});

// @route  : PUT /api/v1/users/changepassword/:id
// @desc   : Update specific user password
// @access : Private/admin/manager
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    },
  );
  if (!user) {
    return next(new ApiError(`No document for this id: ${id}`, 404));
  }
  user.password = undefined;

  res.status(200).json({ data: user });
});

// @route  : DELETE /api/v1/users/:id
// @desc   : Delete specific user
// @access : Private/admin/manager
exports.deleteUser = factory.deleteOne(userModel);

// @route  : UPDATE /api/v1/users/:id
// @desc   : Update specific user
// @access : Private/admin/manager
exports.updateField = factory.changeQuery(userModel, "isActive");

// @route  : GET /api/v1/users/getMe
// @desc   : Get logged user data
// @access : Private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @route  : UPDATE /api/v1/users/updateMyPassword
// @desc   : Update logged user password
// @access : Private/protect
exports.updateMyPassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    },
  );
  if (!user) {
    return next(new ApiError(`No document for this id: ${req.user._id}`, 404));
  }
  const token = generateToken(req.user._id);
  user.password = undefined;

  res.status(200).json({ data: user, token });
});

// @route  : UPDATE /api/v1/users/updateMe
// @desc   : Update logged user data
// @access : Private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      image: req.body.image,
    },
    { new: true },
  );

  if (!user) {
    return next(
      new ApiError(`Not found user belong to this id: ${req.user._id}`, 401),
    );
  }

  res.status(200).json({ data: user });
});

// @route   : DELETE /api/v1/users/deactivate
// @desc    : Deactivate logged user (Soft Delete)
// @access  : Private/Protect
exports.deactivateLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(
      new ApiError(`Not found user belong to this id: ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    message: "User deactivated successfully",
  });
});