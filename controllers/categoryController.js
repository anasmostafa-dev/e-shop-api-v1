const sharp = require("sharp");
// eslint-disable-next-line node/no-missing-require
const { v4: uuidv4 } = require("uuid");

const asyncHandler = require("express-async-handler");
const categoryModel = require("../models/categoryModel");
const factory = require("./factoryHandler");
const { uploadSingleImg } = require("../middlewares/uploadImageMiddleware");

// upload single image
exports.uploadeCategoryImg = uploadSingleImg("image");

// image processing
exports.resizeImageCategory = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 93 })
      .toFile(`uploads/categories/${filename}`);

    // save img in DB
    req.body.image = filename;
  }

  next();
});

// @route  : GET /api/v1/categories/
// @desc   : GET all Category
// @access : Public
exports.getAllCategories = factory.getAll(categoryModel);

// @route  : GET /api/v1/categories/:id
// @desc   : Get Specific Category
// @access : public
exports.getCategory = factory.getOne(categoryModel);

// @route  : POST /api/v1/categories/
// @desc   : Create Category
// @access : Private
exports.createCategory = factory.createOne(categoryModel);

// @route  : PUT /api/v1/categories/:id
// @desc   : Update specific Category
// @access : Private
exports.updateCategory = factory.updateOne(categoryModel);

// @route  : DELETE /api/v1/categories/:id
// @desc   : Delete specific Category
// @access : Private
exports.deleteCategory = factory.deleteOne(categoryModel);
