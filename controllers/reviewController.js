const reviewModel = require("../models/reviewModel");
const factory = require("./factoryHandler");

// @desc   : MW for getAllSubCategories
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;

  next();
};

// @route  : GET /api/v1/reviews
// @desc   : GET all reviews
// @access : Public
exports.getAllReviews = factory.getAll(reviewModel);

// @route  : GET /api/v1/reviews/:id
// @desc   : Get Specific review
// @access : public
exports.getReview = factory.getOne(reviewModel);

// @route  : POST /api/v1/categories/:categoryId/subcategory
// @desc   : MW for createReview --> Nested Route
// @access : public
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  req.body.user = req.user._id;

  next();
};

// @route  : POST /api/v1/reviews
// @desc   : Create review
// @access : Private/protect/user
exports.createReview = factory.createOne(reviewModel);

// @route  : PUT /api/v1/reviews/:id
// @desc   : Update specific review
// @access : Private/protect/user
exports.updateReview = factory.updateOne(reviewModel);

// @route  : DELETE /api/v1/reviews/:id
// @desc   : Delete specific review
// @access : Private/protect/user-admin-manager
exports.deleteReview = factory.deleteOne(reviewModel);
