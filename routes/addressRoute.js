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
  .post(addAddressValidator, addAddress)
  .get(getLoggedUserAddresses);

router.delete("/:addressId", removeAddress);

module.exports = router;
