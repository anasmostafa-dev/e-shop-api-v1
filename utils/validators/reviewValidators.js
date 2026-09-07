const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const reviewModel = require("../../models/reviewModel");

// @desc  Rule for get specific review
exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id"),
  validatorMiddleware,
];

// @desc  Rule for create review
exports.createReviewValidator = [
  check("title").optional(),
  check("rating")
    .notEmpty()
    .withMessage("Rating for product is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating value must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid user id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom(async (val, { req }) => {
      const review = await reviewModel.findOne({
        user: req.user._id,
        product: val,
      });
      console.log(review);

      if (review) {
        throw new Error("You already created a review for this product before");
      }
    }),
  validatorMiddleware,
];

// @desc  Rule for update review
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id")
    .custom(async (val, { req }) => {
      const review = await reviewModel.findById(val);
      if (!review) {
        throw new Error(`There is no review with this id: ${val}`);
      }
      if (review.user.toString() !== req.user._id.toString()) {
        throw new Error("Your are not allowed to perform this action");
      }
    }),
  check("rating")
    .notEmpty()
    .withMessage("Rating for product is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating value must be between 1 to 5"),
  validatorMiddleware,
];

// @desc  Rule for delete review
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Brand id")
    .custom(async (val, { req }) => {
      if (req.user.role === "user") {
        const review = await reviewModel.findById(val);
        if (!review) {
          throw new Error(`There is no review with this id: ${val}`);
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          throw new Error("Your are not allowed to perform this action");
        }
      }
      return true;
    }),
  validatorMiddleware,
];
