const express = require("express");
const { protect, allowedTo } = require("../controllers/authController");
const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificItemCart,
  deleteLoggedUserCart,
  updateItemQuantity,
  applyCouponOnCart,
} = require("../controllers/cartController");
const {
  addProductToCartValidator,
  removeSpecificItemCartValidator,
  updateItemQuantityValidator,
} = require("../utils/validators/cartValidator");
const { applyCouponValidator } = require("../utils/validators/couponValidator");

const router = express.Router();

router.use(protect, allowedTo("user"));
router
  .route("/")
  .post(addProductToCartValidator, addProductToCart)
  .get(getLoggedUserCart)
  .delete(deleteLoggedUserCart);

router.route("/applyCoupon").put(applyCouponValidator, applyCouponOnCart);

router
  .route("/:itemId")
  .put(updateItemQuantityValidator, updateItemQuantity)
  .delete(removeSpecificItemCartValidator, removeSpecificItemCart);

module.exports = router;
