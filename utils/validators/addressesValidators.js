const { body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const userModel = require("../../models/userModel");

// @desc  Rule for create subcategory
exports.addAddressValidator = [
  body("alias")
    .notEmpty()
    .withMessage("Alias for address is required")
    .custom(async (val, { req }) => {
      const user = await userModel.findById(req.user._id);
      const aliasExist = user.addresses.find(
        (addr) => addr.alias.toLowerCase() === val.toLowerCase(),
      );
      if (aliasExist) {
        throw new Error("You already have an address with this alias");
      }
      return true;
    }),
  body("details").notEmpty().withMessage("Details for address is required"),
  body("phone")
    .notEmpty()
    .withMessage("Phone for address is required")
    .isMobilePhone(["ar-EG", "ar-SA", "ar-QA"])
    .withMessage("Invalid phone number only accepted EG and SA, QA numbers"),

  body("city").notEmpty().withMessage("City for address is required"),
  body("postalCode")
    .optional()
    .matches(/^\d{5}$/)
    .withMessage("Postal code must be 5 digits"),

  validatorMiddleware,
];
