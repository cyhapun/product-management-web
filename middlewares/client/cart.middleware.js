const { validateGuestCart } = require('../../helpers/client/cart');

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