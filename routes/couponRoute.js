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

router.route("/").get(getAllCoupons).post(createCoupon);
router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
