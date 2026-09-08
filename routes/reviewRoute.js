const express = require("express");
const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setProductIdAndUserIdToBody,
  createFilterObject
} = require("../controllers/reviewController");

const { protect, allowedTo } = require("../controllers/authController");
const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidators");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObject, /* #swagger.tags = ['Reviews'] */ getAllReviews)
  .post(
    protect,
    allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    /* #swagger.tags = ['Reviews'] */ createReview,
  );

router
  .route("/:id")
  .get(getReviewValidator, /* #swagger.tags = ['Reviews'] */ getReview)
  .put(
    protect,
    allowedTo("user"),
    updateReviewValidator,
    /* #swagger.tags = ['Reviews'] */ updateReview,
  )
  .delete(
    protect,
    allowedTo("user", "manager", "admin"),
    deleteReviewValidator,
    /* #swagger.tags = ['Reviews'] */ deleteReview,
  );

module.exports = router;
