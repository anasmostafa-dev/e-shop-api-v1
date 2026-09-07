const { body } = require("express-validator");
const productModel = require("../../models/productModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// @desc  Rule for add to wishlist
exports.AddToWishlistValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom(async (val) => {
      const product = await productModel.findById(val);
      if (!product) {
        throw new Error("This product does not exist");
      }
      return true;
    }),
  validatorMiddleware,
];
