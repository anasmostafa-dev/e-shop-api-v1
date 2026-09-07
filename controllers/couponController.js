const couponModel = require("../models/couponModel");
const factory = require("./factoryHandler");

// @route  : GET /api/v1/coupons
// @desc   : GET all coupons
// @access : Private
exports.getAllCoupons = factory.getAll(couponModel);

// @route  : GET /api/v1/coupons/:id
// @desc   : Get Specific coupon
// @access : Private
exports.getCoupon = factory.getOne(couponModel);

// @route  : POST /api/v1/coupon
// @desc   : Create coupon
// @access : Private
exports.createCoupon = factory.createOne(couponModel);

// @route  : PUT /api/v1/coupons/:id
// @desc   : Update specific coupon
// @access : Private
exports.updateCoupon = factory.updateOne(couponModel);

// @route  : DELETE /api/v1/coupons/:id
// @desc   : Delete specific coupon
// @access : Private
exports.deleteCoupon = factory.deleteOne(couponModel);
