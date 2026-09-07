const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.applyCouponValidator = [
  check("coupon")
    .notEmpty()
    .withMessage("Coupon code is required")
    .isString()
    .withMessage("Coupon code must be a string"),

  validatorMiddleware,
];
