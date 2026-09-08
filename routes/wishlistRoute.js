const express = require("express");

const { protect, allowedTo } = require("../controllers/authController");
const {
  addProductToWishlist,
  getLoggedUserWishlist,
  removeProductFromWishlist,
} = require("../controllers/wishlistController");
const {
  AddToWishlistValidator,
} = require("../utils/validators/wishlistValidator");

const router = express.Router();

router.use(protect, allowedTo("user"));

router
  .route("/")
  .post(
    AddToWishlistValidator,
    /* #swagger.tags = ['Wishlist'] */ addProductToWishlist,
  )
  .get(/* #swagger.tags = ['Wishlist'] */ getLoggedUserWishlist);

router.delete(
  "/:productId",
  /* #swagger.tags = ['Wishlist'] */ removeProductFromWishlist,
);
module.exports = router;
