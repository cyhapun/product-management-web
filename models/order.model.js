const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Account',
      required: false // Guest checkout có thể không có userId
    },

    info: {
      fullName: { type: String, required: true },
      email: { type: String }, // Nếu muốn optional
      phone: { type: String, required: true }, // lưu string tránh mất số 0
      address: { type: String, required: true }
    },

    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtOrder: { type: Number, required: true }, // lưu giá tại thời điểm order
        discountPercentage: Float,
      }
    ],

    totalPrice: { type: Number, required: true }, // tổng tiền lúc tạo order

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "completed", "cancelled"],
      default: "pending"
    },

    deleted: { type: Boolean, default: false },
    deletedAt: Date
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema, "orders");
module.exports = Order;
