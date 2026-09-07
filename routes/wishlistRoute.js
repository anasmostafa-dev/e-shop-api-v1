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
  .post(AddToWishlistValidator, addProductToWishlist)
  .get(getLoggedUserWishlist);

router.delete("/:productId", removeProductFromWishlist);
module.exports = router;
