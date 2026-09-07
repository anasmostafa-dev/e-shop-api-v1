const express = require("express");
const { protect, allowedTo } = require("../controllers/authController");
const {
  createCashOrder,
  filterOrderForLoggedUser,
  getAllOrders,
  getSpecificOrder,
  updateOrderStatus,
  cancelOrder,
  updateOrderIsPaid,
  checkoutSession,
} = require("../controllers/orderController");
const {
  updateOrderStatusValidator,
} = require("../utils/validators/orderValidation");

const router = express.Router();

router.get(
  "/checkout-session/:cartId",
  protect,
  allowedTo("user"),
  checkoutSession,
);

router.route("/:cartId").post(protect, allowedTo("user"), createCashOrder);

router.get(
  "/",
  protect,
  allowedTo("admin", "manager", "user"),
  filterOrderForLoggedUser,
  getAllOrders,
);

router.get(
  "/:id",
  protect,
  allowedTo("admin", "manager", "user"),
  filterOrderForLoggedUser,
  getSpecificOrder,
);

router.put(
  "/:id/pay",
  protect,
  allowedTo("admin", "manager"),
  updateOrderIsPaid,
);
router.put(
  "/:id/status",
  protect,
  allowedTo("admin", "manager"),
  updateOrderStatusValidator,
  updateOrderStatus,
);
router.put(
  "/:id/cancle",
  protect,
  allowedTo("admin", "manager", "user"),
  cancelOrder,
);
module.exports = router;
