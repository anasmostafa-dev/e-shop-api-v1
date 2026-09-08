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
  .post(
    addProductToCartValidator,
    /* #swagger.tags = ['Cart'] */ addProductToCart,
  )
  .get(/* #swagger.tags = ['Cart'] */ getLoggedUserCart)
  .delete(/* #swagger.tags = ['Cart'] */ deleteLoggedUserCart);

router
  .route("/applyCoupon")
  .put(applyCouponValidator, /* #swagger.tags = ['Cart'] */ applyCouponOnCart);

router
  .route("/:itemId")
  .put(
    updateItemQuantityValidator,
    /* #swagger.tags = ['Cart'] */ updateItemQuantity,
  )
  .delete(
    removeSpecificItemCartValidator,
    /* #swagger.tags = ['Cart'] */ removeSpecificItemCart,
  );

module.exports = router;
