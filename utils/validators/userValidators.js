const { check, body } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const userModel = require("../../models/userModel");

// @desc  Rule for get specific user
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  validatorMiddleware,
];

// @desc  Rule for create user
exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("User name is too short")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) return Promise.reject(new Error("E-mail already in use"));
      }),
    ),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "ar-QA"])
    .withMessage("Invalid phone number only accepted EG and SA, QA numbers"),

  check("image").optional(),

  check("role").optional(),
  validatorMiddleware,
];

// @desc  Rule for update user
exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) return Promise.reject(new Error("E-mail already in use"));
      }),
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "ar-QA"])
    .withMessage("Invalid phone number only accepted EG and SA, QA numbers"),

  check("image").optional(),

  check("role")
    .optional()
    .isIn(["user", "manager", "admin"])
    .withMessage("Invalid role value"),
  validatorMiddleware,
];

// @desc  Rule for update password for user
exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),

  body("currentPassword")
    .notEmpty()
    .withMessage("You must be enter current password"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must be enter password confirmation"),

  body("password")
    .notEmpty()
    .withMessage("You must be enter new password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(async (val, { req }) => {
      // 1- verify current password
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new Error("Not found user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      // 2- verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match password");
      }

      // 3- check if password == curent password
      if (val === req.body.currentPassword) {
        throw new Error("Password must be different");
      }

      return true;
    }),
  validatorMiddleware,
];

// @desc  Rule for delete user
exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),
  validatorMiddleware,
];
// @desc  Rule for change status (isActive)
exports.updateQueryValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),
  check("isActive")
    .notEmpty()
    .withMessage("isActive status is required")
    .isBoolean()
    .withMessage("isActive must be a boolean value (true or false)"),
  validatorMiddleware,
];

// @desc   Validator for logged-in user updating their own password
exports.updateLoggedUserPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter password confirmation"),

  body("password")
    .notEmpty()
    .withMessage("You must enter a new password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(async (val, { req }) => {
      const user = await userModel.findById(req.user._id).select("+password");

      if (!user) {
        throw new Error("User not found");
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      if (val !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match password");
      }

      if (val === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }

      return true;
    }),
  validatorMiddleware,
];

// @desc  Rule for update logged user
exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) return Promise.reject(new Error("E-mail already in use"));
      }),
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "ar-QA"])
    .withMessage("Invalid phone number only accepted EG and SA, QA numbers"),

  check("image").optional(),
  validatorMiddleware,
];
