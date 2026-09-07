const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const categoryModel = require("../../models/categoryModel");
const subCategoryModel = require("../../models/subCategoryModel");
const brandModel = require("../../models/brandModel");

// @desc  Rule for create product
exports.createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product title is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("desc")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),

  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),

  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isFloat({ min: 1 })
    .withMessage("Error for price"),

  check("priceAfterDiscount")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .custom((value, { req }) => {
      // لا يمكن أن يكون الخصم أكبر من السعر الأصلي
      if (req.body.price && value > req.body.price) {
        throw new Error(
          "Price after discount must be lower than original price",
        );
      }
      return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors should be array of string"),
  check("coverImage").notEmpty().withMessage("Cover image is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Images should be array of string"),
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to category")
    .isMongoId()
    .withMessage("Invalid ID format")
    .custom(async (categoryId) => {
      const category = await categoryModel.findById(categoryId);

      if (!category) {
        throw new Error(`No category for this id: ${categoryId}`);
      }
      return true;
    }),

  check("subcategory")
    .optional()
    .isArray()
    .withMessage("Subcategory must be an array of IDs"),

  check("subcategory.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID format"),

  check("subcategory")
    .optional()
    .custom(async (subcategoryIds, { req }) => {
      if (subcategoryIds.length === 0) return true;

      const subCategory = await subCategoryModel.find({
        _id: { $in: subcategoryIds },
      });

      if (subCategory.length !== subcategoryIds.length) {
        throw new Error(`One or more subcategory IDs are invalid`);
      }

      // verify for subcategory belong to category or no
      const isBelonging = subCategory.every(
        (sub) => sub.category.toString() === req.body.category,
      );

      if (!isBelonging) {
        throw new Error(
          `One or more subcategories do not belong to this category`,
        );
      }
      return true;
    }),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invailed id format")
    .custom(async (brandId) => {
      const brand = await brandModel.findById(brandId);
      if (!brand) {
        throw new Error(`No brand for this id: ${brandId}`);
      }

      return true;
    }),
  check("ratingsAvg")
    .optional()
    .isNumeric()
    .withMessage("Product rating must ba a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Product rating must be between 1.0 : 5.0"),
  check("ratingsQty")
    .optional()
    .isNumeric()
    .withMessage("Product ratings quantity must be a number"),
  validatorMiddleware,
];

// @desc  Rule for get specific product
exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id"),
  validatorMiddleware,
];

// @desc  Rule for update product
exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

// @desc  Rule for delete product
exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id"),
  validatorMiddleware,
];
