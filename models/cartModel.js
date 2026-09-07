const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      color: String,
      quantity: {
        type: Number,
        default: 1,
      },
      price: Number,
    },
  ],
  totalCartPrice: Number,
  totalPriceAfterDiscount: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("Cart", cartSchema);
