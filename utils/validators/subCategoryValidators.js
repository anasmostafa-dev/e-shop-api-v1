const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// @desc  Rule for get specific subcategory
exports.getSubCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("subCategory is required")
    .isMongoId()
    .withMessage("Invalid subCategory id"),
  validatorMiddleware,
];

// @desc  Rule for create subcategory
exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name is required")
    .isLength({ min: 2 })
    .withMessage("To short subCategory name")
    .isLength({ max: 32 })
    .withMessage("To long subCategory name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("SubCategory must be belong to category")
    .isMongoId()
    .withMessage("Invalid category id format"),
  validatorMiddleware,
];

// @desc  Rule for update subcategory
exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subCategory id"),
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

// @desc  Rule for delete subcategory
exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subCategory id"),
  validatorMiddleware,
];
