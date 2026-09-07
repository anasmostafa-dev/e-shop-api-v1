const { body, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createOrderValidator = [
  param("cartId").isMongoId().withMessage("Invalid Cart ID format"),

  body("addressId")
    .optional()
    .isMongoId()
    .withMessage("Invalid Address ID format"),

  // if user not send addressId in body
  body("shippingAddress.details")
    .if(body("addressId").not().exists())
    .notEmpty()
    .withMessage("Shipping address details are required"),

  body("shippingAddress.phone")
    .if(body("addressId").not().exists())
    .notEmpty()
    .withMessage("Phone for address is required")
    .isMobilePhone(["ar-EG", "ar-SA", "ar-QA"])
    .withMessage("Invalid phone number only accepted EG, SA, QA numbers"),

  body("shippingAddress.city")
    .if(body("addressId").not().exists())
    .notEmpty()
    .withMessage("City for address is required"),

  body("shippingAddress.postalCode")
    .optional()
    .matches(/^\d{5}$/)
    .withMessage("Postal code must be 5 digits"),

  validatorMiddleware,
];

exports.getOneOrderValidator = [
  // Check valid id for order params
  param("id").isMongoId().withMessage("Invalid Order ID format"),
  validatorMiddleware,
];

exports.updateOrderStatusValidator = [
  // Check valid id for order params
  param("id").isMongoId().withMessage("Invalid Order ID format"),
  // Check if req.body.status in enum values DB
  body("status")
    .notEmpty()
    .withMessage("Order status required")
    .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    .withMessage(
      "Invalid status value. Allowed values: pending, processing, shipped, delivered, cancelled",
    ),
  validatorMiddleware,
];
