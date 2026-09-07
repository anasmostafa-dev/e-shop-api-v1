const asyncHandler = require("express-async-handler");
const cartModel = require("../models/cartModel");
const couponModel = require("../models/couponModel");
const productModel = require("../models/productModel");
const ApiError = require("../utils/apiError");

// helper function (calculation for total price)
const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// helper function (calculation for n(quantities), n(items))
const calcCartItemsAndQuantity = (cart) => {
  const totalQuantity = cart.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const numOfCartItems = cart.cartItems.length;
  return {
    totalQuantity,
    numOfCartItems,
  };
};

// @route  : POST /api/v1/cart
// @desc   : Add product in my cart
// @access : protection/user
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await productModel.findById(productId);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // check if quantity > 0
  // check if productId is valid

  let cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    // Create cart fot logged user with product
    cart = await cartModel.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
        },
      ],
    });
  } else {
    // Check this product exist? update ptoduct quantity
    const productIndex = cart.cartItems.findIndex((item) => {
      return item.product.toString() === productId && item.color === color;
    });

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // push product to cart if product not exist
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // calculation total price
  const totalPrice = calcTotalCartPrice(cart);

  cart.totalCartPrice = totalPrice;
  await cart.save();

  const { totalQuantity, numOfCartItems } = calcCartItemsAndQuantity(cart);

  res.status(200).json({
    status: "Success",
    message: "Product added successfully",
    summary: {
      numOfCartItems,
      totalQuantity,
    },
    data: cart,
  });
});

// @route  : GET /api/v1/cart
// @desc   : Get my cart
// @access : protection/user
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id: ${req.user._id}`, 404),
    );
  }
  cart.totalPriceAfterDiscount = undefined;

  const { totalQuantity, numOfCartItems } = calcCartItemsAndQuantity(cart);

  res.status(200).json({
    status: "Success",
    summary: {
      numOfCartItems,
      totalQuantity,
    },
    data: cart,
  });
});

// @route  : DELETE /api/v1/cart/:itemId
// @desc   : Delete specific item in cart
// @access : protection/user
exports.removeSpecificItemCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true },
  );

  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  const { totalQuantity, numOfCartItems } = calcCartItemsAndQuantity(cart);

  res.status(200).json({
    status: "Success",
    summary: {
      numOfCartItems,
      totalQuantity,
    },
    data: cart,
  });
});

// @route  : DELETE /api/v1/cart/:userId
// @desc   : Delete cart
// @access : protection/user
exports.deleteLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndDelete({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  res.status(204).send();
});

// @route  : UPDATE /api/v1/cart/:itemId
// @desc   : Update item quantity
// @access : protection/user
exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  const itemIndex = cart.cartItems.findIndex((item) => {
    return item._id.toString() === req.params.itemId;
  });

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`There is no item for this id: ${req.params.itemId}`, 404),
    );
  }

  cart.totalCartPrice = calcTotalCartPrice(cart);
  await cart.save();

  const { totalQuantity, numOfCartItems } = calcCartItemsAndQuantity(cart);

  res.status(200).json({
    status: "Success",
    summary: {
      numOfCartItems,
      totalQuantity,
    },
    data: cart,
  });
});

// @route  : UPDATE /api/v1/cart/applyCoupon
// @desc   : Apply coupon on cart
// @access : protection/user
exports.applyCouponOnCart = asyncHandler(async (req, res, next) => {
  const couponName = req.body.coupon
    ? req.body.coupon.trim().toUpperCase()
    : "";

  // 1- Get coupon based on coupon name
  const coupon = await couponModel.findOne({
    name: couponName,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError(`Coupon is invalid or expired`, 400));
  }

  // 2- Get cart to get total cart price
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  if (cart.cartItems.length === 0) {
    return next(new ApiError("Cannot apply coupon to an empty cart", 400));
  }

  const totalPrice = cart.totalCartPrice;

  const totalPriceAfterDiscount = Number(
    (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2),
  );

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  const { totalQuantity, numOfCartItems } = calcCartItemsAndQuantity(cart);

  res.status(200).json({
    status: "Success",
    summary: {
      numOfCartItems,
      totalQuantity,
    },
    data: cart,
  });
});
