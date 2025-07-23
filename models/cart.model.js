const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    products: [{
      productId: String,
      quantity: Number,
      default:[],
    }],
    totalQuantity: {
      type:Number,
      default:0,
    },
    totalPrice: {
      type:Number,
      default:0,
    }
  },
  {
    timestamps: true
  }
);

const Cart = mongoose.model("Cart", cartSchema, "carts");

module.exports = Cart;
