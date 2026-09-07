const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");

// @route  : POST /api/v1/addresses
// @desc   : Add address To addresses array
// @access : Protection/user
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true },
  );

  res.status(200).json({
    message: "Address added successfully",
    data: user.addresses,
  });
});

// @route  : DELETE /api/v1/addresses/:addressId
// @desc   : Delete address From adresses arrray
// @access : Protection/user
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true },
  );

  res.status(200).json({
    message: "Address deleted successfully",
    data: user.addresses,
  });
});

// @route  : GET /api/v1/addresses
// @desc   : Get All addresses belong mi
// @access : Protection/user
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  res.status(200).json({
    status: "success",
    result: user.addresses.length,
    data: user.addresses,
  });
});
