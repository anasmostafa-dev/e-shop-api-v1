const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const factory = require("./factoryHandler");
const ApiError = require("../utils/apiError");

// exports.getShippingAddress = async (req, next) => {
//   let shippingAddress;

//   if (req.body.addressId) {
//     const user = await userModel.findById(req.user._id);
//     const userAddress = user.addresses.find(
//       (addr) => addr._id.toString() === req.body.addressId
//     );

//     if (!userAddress) {
//       return next(
//         new ApiError("Address not found in your saved addresses", 404)
//       );
//     }

//     shippingAddress = {
//       details: userAddress.details,
//       phone: userAddress.phone,
//       city: userAddress.city,
//       postalCode: userAddress.postalCode,
//     };
//   } else if (req.body.shippingAddress) {
//     shippingAddress = req.body.shippingAddress;
//   } else {
//     return next(
//       new ApiError("Please provide a shipping address or addressId", 400)
//     );
//   }

//   return shippingAddress;
// };

// @route  : POST /api/v1/orders/:cartId
// @desc   : Create cash order
// @access : protection/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1- Get cart depend on cartId
  const cart = await cartModel.findOne({
    _id: req.params.cartId,
    user: req.user._id,
  });

  if (!cart || cart.cartItems.length === 0) {
    return next(new ApiError("There is no cart for this user", 404));
  }
  // 2- Get total cart price depend on cart price
  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3- Create order default payment method type : cash, support address sended (body, addressId)
  let shippingAddress;

  if (req.body.addressId) {
    const user = await userModel.findById(req.user._id);
    const userAddress = user.addresses.find(
      (addr) => addr._id.toString() === req.body.addressId,
    );

    if (!userAddress) {
      return next(
        new ApiError("Address not found in your saved addresses", 404),
      );
    }

    shippingAddress = {
      details: userAddress.details,
      phone: userAddress.phone,
      city: userAddress.city,
      postalCode: userAddress.postalCode,
    };
  } else if (req.body.shippingAddress) {
    // 2- if send shippingAddress in body
    shippingAddress = req.body.shippingAddress;
  } else {
    return next(
      new ApiError("Please provide a shipping address or addressId", 400),
    );
  }

  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice,
  });
  // 4- After creating order, decrement product quantity, increament product sold
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await productModel.bulkWrite(bulkOptions, {});

    // 5- Clear cart depend on cartId
    await cartModel.findByIdAndDelete(cart._id);
  }

  res.status(201).json({ status: "Success", data: order });
});

// middleware helped filteration get all orders based on userId
exports.filterOrderForLoggedUser = (req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
};
// @route  : GET /api/v1/orders
// @desc   : Get all orders (admin), get orders based on user.id
// @access : protection/user-admin-manager
exports.getAllOrders = factory.getAll(orderModel);

// @route  : GET /api/v1/orders/:id
// @desc   : Get specific order , verify this order is belong to req.user._id
// @access : protection/user-admin-manager
exports.getSpecificOrder = factory.getOne(orderModel);

// @route  : PUT /api/v1/orders/:id/pay
// @desc   : Update order status paid
// @access : protection/admin-manager
exports.updateOrderIsPaid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderModel.findById(id);
  if (!order) {
    return next(new ApiError(`There is no order for this id: ${id}`, 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "Success", data: updatedOrder });
});

// @route   : PUT /api/v1/orders/:id/status
// @desc    : Update order status (Admin/Manager)
// @access  : protection/admin-manager
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  const order = await orderModel.findById(id);
  if (!order) {
    return next(new ApiError(`There is no order for this id: ${id}`, 404));
  }

  order.status = status;

  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.status(200).json({ status: "Success", data: updatedOrder });
});

// @route   : PUT /api/v1/orders/:id/cancel
// @desc    : Cancel order by logged user
// @access  : protection/user-admin-manager
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // 1- filteration for check if user, cancle your order
  let filter = { _id: id };
  if (req.user.role === "user") {
    filter = { _id: id, user: req.user._id };
  }

  const order = await orderModel.findOne(filter);
  if (!order) {
    return next(new ApiError(`No order found with this id: ${id}`, 404));
  }

  if (["shipped", "delivered", "cancelled"].includes(order.status)) {
    return next(
      new ApiError(
        `Cannot cancel order after it has been ${order.status}`,
        400,
      ),
    );
  }

  // 2- Increment product quantity & decrement product sold in database
  const bulkOptions = order.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: +item.quantity, sold: -item.quantity } },
    },
  }));
  await productModel.bulkWrite(bulkOptions, {});

  order.status = "cancelled";

  const updatedOrder = await order.save();
  res.status(200).json({
    status: "Success",
    message: "Order cancelled successfully",
    data: updatedOrder,
  });
});

// @route   : GET /api/v1/orders/checkout-session/:cartId
// @desc    : Get checkout session from stripe and send session it as response
// @access  : protection/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1- Get cart depend on cartId
  const cart = await cartModel.findOne({
    _id: req.params.cartId,
    user: req.user._id,
  });

  if (!cart || cart.cartItems.length === 0) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  // 2- Extract shipping address (Same logic as createCashOrder)
  let shippingAddress;

  if (req.body.addressId) {
    const user = await userModel.findById(req.user._id);
    const userAddress = user.addresses.find(
      (addr) => addr._id.toString() === req.body.addressId,
    );

    if (!userAddress) {
      return next(
        new ApiError("Address not found in your saved addresses", 404),
      );
    }

    shippingAddress = {
      details: userAddress.details,
      phone: userAddress.phone,
      city: userAddress.city,
      postalCode: userAddress.postalCode,
    };
  } else if (req.body.shippingAddress) {
    // 2- if send shippingAddress in body
    shippingAddress = req.body.shippingAddress;
  } else {
    return next(
      new ApiError("Please provide a shipping address or addressId", 400),
    );
  }

  // 3- Get total cart price depend on cart price
  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 4- Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: Math.round(totalOrderPrice * 100),
          product_data: {
            name: `Order for ${req.user.name}`,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: {
      details: shippingAddress.details,
      phone: shippingAddress.phone,
      city: shippingAddress.city,
      postalCode: shippingAddress.postalCode || "",
    },
  });

  res.status(200).json({ status: "Success", session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const totalPrice = session.amount_total / 100;
  const shippingAddress = session.metadata;

  // Get data from DB
  const cart = await cartModel.findById(cartId);
  const user = await userModel.findOne({ email: session.customer_email });

  // Check cart, user if not exist
  if (!cart || !user) {
    console.error("Cart or User not found for Webhook order creation.");
    return;
  }
  // Create order payment method type : card, support address sended (body, addressId)
  const order = await orderModel.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: totalPrice,
    paymentMethodType: "card",
    isPaid: true,
    paidAt: Date.now(),
  });

  // After creating order, decrement product quantity, increament product sold
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await productModel.bulkWrite(bulkOptions, {});

    // Clear cart depend on cartId
    await cartModel.findByIdAndDelete(cartId);
  }
};
// @route   : POST webhook-checkout
// @desc    : This webhook will run stripe payment success paid
// @access  : protection/user
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Create order
    await createCardOrder(session);
  }
  res.status(200).json({ received: true });
});
