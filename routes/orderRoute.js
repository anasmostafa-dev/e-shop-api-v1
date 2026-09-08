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
  /* #swagger.tags = ['Orders'] */ checkoutSession,
);

router
  .route("/:cartId")
  .post(protect, allowedTo("user"), /* #swagger.tags = ['Orders'] */ createCashOrder);

router.get(
  "/",
  protect,
  allowedTo("admin", "manager", "user"),
  filterOrderForLoggedUser,
  /* #swagger.tags = ['Orders'] */ getAllOrders,
);

router.get(
  "/:id",
  protect,
  allowedTo("admin", "manager", "user"),
  filterOrderForLoggedUser,
  /* #swagger.tags = ['Orders'] */ getSpecificOrder,
);

router.put(
  "/:id/pay",
  protect,
  allowedTo("admin", "manager"),
  /* #swagger.tags = ['Orders'] */ updateOrderIsPaid,
);
router.put(
  "/:id/status",
  protect,
  allowedTo("admin", "manager"),
  updateOrderStatusValidator,
  /* #swagger.tags = ['Orders'] */ updateOrderStatus,
);
router.put(
  "/:id/cancle",
  protect,
  allowedTo("admin", "manager", "user"),
  /* #swagger.tags = ['Orders'] */ cancelOrder,
);
module.exports = router;
