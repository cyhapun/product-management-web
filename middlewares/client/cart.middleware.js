const { validateGuestCart } = require('../../helpers/client/cart');
const Accounts = require('../../models/account.model');
const Carts = require('../../models/cart.model');
const CartsHelpers = require('../../helpers/client/cart');

module.exports.addTotalQuantityInCart = async (req, res, next) => {
  const token = req.cookies.token;

  if (token && 0) {
    return next();
  }

  const rawCart = req.cookies.guestCart || "";

  const cart = await validateGuestCart(rawCart);

  res.locals.cart = cart;

  res.cookie("guestCart", JSON.stringify(cart), {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 
  });

  next();
};

module.exports.getCartWithInfoProducts = async (req, res, next) => {
  const token = req.cookies.token;
  let cart = null;
  
  if (token) {
    const user = await Accounts.findById(token.userId);
    if (user) {
      cart = await Carts.findOne({ userId: user._id });
      if (cart) {
        res.clearCookie('guestCart'); // clear guestCart if existed 
      }
    } else {
      res.clearCookie('token');
    }
  }

  if (!cart) {
    const rawCart = req.cookies.guestCart || "";
    cart = await CartsHelpers.validateGuestCart(rawCart);
  }
  if (!cart) {
    cart = { products: [], totalQuantity: 0 }
    console.warn("Not found cart!");
  }
  cart = await CartsHelpers.addInfoProductInCart(cart);
  res.locals.cart = cart;
  next();
};