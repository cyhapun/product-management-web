const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    products: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'Product',
      quantity: Number,
    }],
    totalQuantity: Number,
    totalPrice: Number,
  },
  {
    timestamps: true
  }
);

const Cart = mongoose.model("Cart", cartSchema, "carts");

module.exports = Cart;
