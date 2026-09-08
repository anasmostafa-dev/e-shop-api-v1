const express = require("express");

const { protect, allowedTo } = require("../controllers/authController");
const {
  getAllCoupons,
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.use(protect, allowedTo("manager", "admin"));

router
  .route("/")
  .get(/* #swagger.tags = ['Coupons'] */ getAllCoupons)
  .post(/* #swagger.tags = ['Coupons'] */ createCoupon);
router
  .route("/:id")
  .get(/* #swagger.tags = ['Coupons'] */ getCoupon)
  .put(/* #swagger.tags = ['Coupons'] */ updateCoupon)
  .delete(/* #swagger.tags = ['Coupons'] */ deleteCoupon);

module.exports = router;
