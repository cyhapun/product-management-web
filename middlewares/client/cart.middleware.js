const { validateGuestCart } = require('../../helpers/client/cart');
const Users = require('../../models/user.model');
const Carts = require('../../models/cart.model');
const CartsHelpers = require('../../helpers/client/cart');

module.exports.addTotalQuantityInCart = async (req, res, next) => {
  const userToken = req.cookies.userToken;
  
  if (userToken && res.locals.user) {
    let cart = await Carts.findOne({
      userId:res.locals.user._id,
    });
    if (!cart) {
      cart = new Carts({userId:res.locals.user._id});
      await cart.save();
    }
    res.clearCookie('guestCart');
    res.locals.cart = cart;
    return next();
  }
  else {
    res.clearCookie('userToken');
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
  const userToken = req.cookies.userToken;
  let cart = null;
  
  if (userToken) {
    const user = await Users.findById(userToken.userId);
    if (user) {
      cart = await Carts.findOne({ userId: user._id });
      if (cart) {
        res.clearCookie('guestCart'); // clear guestCart if existed 
      }
    } else {
      res.clearCookie('userToken');
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