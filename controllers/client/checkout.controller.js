const CartHelpers = require('../../helpers/client/cart');
const Carts = require('../../models/cart.model');

// [GET] '/checkout'
module.exports.index = async (req, res) => {
  try {
    const token = req.cookies.token;
    let carts = null;

    if (token) {
      // User login
      const user = await Accounts.findOne({ token });
      if (user) {
        carts = await Carts.findOne({ userId: user._id });
        if (!carts) {
          carts = { products: [], totalQuantity: 0, totalPrice: 0 };
        }
        // Enrich thông tin sản phẩm từ DB
        carts = await CartHelpers.addInfoProductInCart(carts);
      } else {
        res.clearCookie('token');
      }
    } else {
      // Guest: lấy cookie + validate
      if (req.cookies.guestCart) {
        carts = await CartHelpers.validateGuestCart(req.cookies.guestCart);
        carts = await CartHelpers.addInfoProductInCart(carts);
      }
      if (!carts) carts = { products: [], totalQuantity: 0 };
    }

    res.render('client/pages/checkout/index.pug', {
      pageTitle: "Checkout",
      cart: carts,
    });

  } catch (error) {
    console.error("Error when display cart:", error);
    res.redirect(req.get("Referrer") || "/");
  }
}

// [POST] '/checkout/order'
module.exports.orderPost = async (req, res) => {
  res.send("OK");
}