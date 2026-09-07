const { check, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const productModel = require("../../models/productModel");
const cartModel = require("../../models/cartModel");

// Validation => Add Product To Cart
exports.addProductToCartValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format")
    .custom(async (productId, { req }) => {
      // 1- check product if exist
      const product = await productModel.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // 2- check if quantity is available
      if (product.quantity < 1) {
        throw new Error("This product is currently out of stock");
      }

      // 2- Check if color sending and color sended is belong to product colors
      if (req.body.color) {
        if (!product.colors || product.colors.length === 0) {
          throw new Error("This product does not have color options");
        }
        if (!product.colors.includes(req.body.color)) {
          throw new Error(
            `Selected color is unavailable. Available colors: [${product.colors.join(", ")}]`,
          );
        }
      }

      return true;
    }),

  check("color")
    .optional()
    .isString()
    .withMessage("Color must be a valid string"),

  check("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer (at least 1)"),

  validatorMiddleware,
];

// Validation => Remove Specific Item cart
exports.removeSpecificItemCartValidator = [
  param("itemId").isMongoId().withMessage("Invalid Cart Item ID format"),
  validatorMiddleware,
];

// Validation => Update quantity for item
exports.updateItemQuantityValidator = [
  param("itemId")
    .isMongoId()
    .withMessage("Invalid Cart Item ID format")
    .custom(async (itemId, { req }) => {
      const cart = await cartModel.findOne({ user: req.user._id });
      if (!cart) {
        throw new Error("Cart not found");
      }

      const item = cart.cartItems.find((i) => i._id.toString() === itemId);
      if (!item) {
        throw new Error("Item not found in your cart");
      }

      // 3- Get product for this item
      const product = await productModel.findById(item.product);
      if (!product) {
        throw new Error("Associated product no longer exists");
      }

      // 4- Check if quantity sended is enough?
      const newQuantity = req.body.quantity;
      if (newQuantity > product.quantity) {
        throw new Error(
          `Cannot update quantity. Only ${product.quantity} items available in stock.`,
        );
      }

      return true;
    }),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  validatorMiddleware,
];
