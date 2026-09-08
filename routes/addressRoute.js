const express = require("express");
const {
  addAddress,
  getLoggedUserAddresses,
  removeAddress,
} = require("../controllers/addressController");
const {
  addAddressValidator,
} = require("../utils/validators/addressesValidators");
const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, allowedTo("user"));

router
  .route("/")
  .post(addAddressValidator, /* #swagger.tags = ['Addresses'] */ addAddress)
  .get(/* #swagger.tags = ['Addresses'] */ getLoggedUserAddresses);

router.delete("/:addressId", /* #swagger.tags = ['Addresses'] */ removeAddress);

module.exports = router;
