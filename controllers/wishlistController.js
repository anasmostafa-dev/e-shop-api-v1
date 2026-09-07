const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");

// @route  : POST /api/v1/wishlist/
// @desc   : Add Product To Wishlist
// @access : Protection/user
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true },
  );

  res.status(200).json({
    message: "Product added successfully to your wishlist",
    data: user.wishlist,
  });
});

// @route  : DELETE /api/v1/wishlist/:productId
// @desc   : Delete Product From Wishlist
// @access : Protection/user
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true },
  );

  res.status(200).json({
    message: "Product deleted successfully from your wishlist",
    data: user.wishlist,
  });
});

// @route  : GET /api/v1/wishlist
// @desc   : Get All Products In My Wishlist
// @access : Protection/user
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).populate("wishlist");
  res
    .status(200)
    .json({
      status: "sussess",
      result: user.wishlist.length,
      data: user.wishlist,
    });
});
