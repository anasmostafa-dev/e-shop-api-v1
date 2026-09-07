const sharp = require("sharp");
// eslint-disable-next-line node/no-missing-require
const { v4: uuidv4 } = require("uuid");

const asyncHandler = require("express-async-handler");
const productModel = require("../models/productModel");
const factory = require("./factoryHandler");
const { uploadMultiImages } = require("../middlewares/uploadImageMiddleware");

exports.uploadImagesProduct = uploadMultiImages([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

// 1- image processing for cover image
exports.resizeImageProduct = asyncHandler(async (req, res, next) => {
  if (req.files.coverImage) {
    const productImgCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.coverImage[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${productImgCoverFilename}`);

    // save img in DB
    req.body.coverImage = productImgCoverFilename;
  }

  // 2- image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, idx) => {
        const productImgFilename = `product-${uuidv4()}-${Date.now()}-${idx + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${productImgFilename}`);

        // save img in DB
        req.body.images.push(productImgFilename);
      }),
    );
    next();
  }
});

// @route  : GET /api/v1/products/
// @desc   : GET All Products
// @access : Public
exports.getAllproducts = factory.getAll(productModel, "Products");

// @route  : GET /api/v1/products/:id
// @desc   : Get Specific Product
// @access : Public
exports.getProduct = factory.getOne(productModel, "reviews");

// @route  : POST /api/v1/products/
// @desc   : Create Product
// @access : Private
exports.createProduct = factory.createOne(productModel);

// @route  : PUT /api/v1/products/:id
// @desc   : Update specific Product
// @access : Private
exports.updateProduct = factory.updateOne(productModel);

// @route  : DELETE /api/v1/products/:id
// @desc   : Delete specific Product
// @access : Private
exports.deleteProduct = factory.deleteOne(productModel);
