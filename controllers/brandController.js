const sharp = require("sharp");
// eslint-disable-next-line node/no-missing-require
const { v4: uuidv4 } = require("uuid");

const asyncHandler = require("express-async-handler");
const brandModel = require("../models/brandModel");
const factory = require("./factoryHandler");
const { uploadSingleImg } = require("../middlewares/uploadImageMiddleware");

// upload single image
exports.uploadeBrandImg = uploadSingleImg("image");

// image processing
exports.resizeImageBrand = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/brands/${filename}`);

    // save img in DB
    req.body.image = filename;
  }

  next();
});

// @route  : GET /api/v1/brands/
// @desc   : GET all brands
// @access : Public
exports.getAllBrands = factory.getAll(brandModel);

// @route  : GET /api/v1/brands/:id
// @desc   : Get Specific brand
// @access : public
exports.getBrand = factory.getOne(brandModel);
// @route  : POST /api/v1/brands/
// @desc   : Create brand
// @access : Private
exports.createBrand = factory.createOne(brandModel);

// @route  : PUT /api/v1/brands/:id
// @desc   : Update specific brand
// @access : Private
exports.updateBrand = factory.updateOne(brandModel);

// @route  : DELETE /api/v1/brands/:id
// @desc   : Delete specific brand
// @access : Private
exports.deleteBrand = factory.deleteOne(brandModel);
