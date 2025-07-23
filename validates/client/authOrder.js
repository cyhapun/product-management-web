// middlewares/validateOrder.js
const CartHelpers = require('../../helpers/client/cart');
const Carts = require('../../models/cart.model');
const Accounts = require('../../models/account.model');

module.exports = async function validateOrder(req, res, next) {
  try {
    const { fullName, email, phone, address } = req.body;

    // 1️⃣ Validate thông tin người nhận
    if (!fullName || fullName.trim().length < 2) {
      req.flash('error', 'Full name is required and must be at least 2 characters.');
      return res.redirect('/checkout');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      req.flash('error', 'Invalid email format.');
      return res.redirect('/checkout');
    }

    const phoneRegex = /^[0-9]{8,15}$/; // tùy format, ở đây là 8-15 chữ số
    if (!phone || !phoneRegex.test(phone)) {
      req.flash('error', 'Invalid phone number.');
      return res.redirect('/checkout');
    }

    if (!address || address.trim().length < 5) {
      req.flash('error', 'Address is required and must be at least 5 characters.');
      return res.redirect('/checkout');
    }

    // 2️⃣ Kiểm tra giỏ hàng có sản phẩm không
    const token = req.cookies.token;
    let cart = null;

    if (token) {
      const user = await Accounts.findOne({ token });
      if (user) {
        cart = await Carts.findOne({ userId: user._id });
      } else {
        res.clearCookie('token');
      }
    } else {
      if (req.cookies.guestCart) {
        cart = await CartHelpers.validateGuestCart(req.cookies.guestCart);
      }
    }

    if (!cart || !cart.products || cart.products.length === 0) {
      req.flash('error', 'Your cart is empty. Please add some products before ordering.');
      return res.redirect('/checkout');
    }

    // Nếu mọi thứ OK → cho qua
    next();
  } catch (error) {
    console.error('Error in validateOrder middleware:', error);
    req.flash('error', 'Something went wrong when validating order.');
    return res.redirect('/checkout');
  }
};
