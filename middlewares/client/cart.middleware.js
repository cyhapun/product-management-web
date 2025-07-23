const { validateGuestCart, addInfoProductInCart } = require('../../helpers/client/cart');
const Users = require('../../models/user.model');
const Carts = require('../../models/cart.model');

/**
 * Middleware 1: Đồng bộ giỏ hàng
 *  - Nếu user login → load cart từ DB, tạo mới nếu chưa có
 *  - Nếu guest → validate guestCart từ cookie
 */
module.exports.addTotalQuantityInCart = async (req, res, next) => {
  const userToken = req.cookies.userToken;

  if (userToken && res.locals.user) {
    // ✅ Nếu đã login → lấy cart từ DB
    let cart = await Carts.findOne({ userId: res.locals.user._id });

    if (!cart) {
      cart = new Carts({
        userId: res.locals.user._id,
        products: [],
        totalQuantity: 0,
        totalPrice: 0
      });
      await cart.save();
    }

    // ✅ Nếu login thì xóa guestCart
    res.clearCookie('guestCart');

    res.locals.cart = cart; // ✅ luôn là mongoose document
    return next();
  }

  // ❌ Nếu có userToken nhưng không hợp lệ → clear cookie
  if (userToken && !res.locals.user) {
    res.clearCookie('userToken');
  }

  // ✅ Guest → validate cart từ cookie
  const rawCart = req.cookies.guestCart || "";
  const guestCart = await validateGuestCart(rawCart);

  res.locals.cart = guestCart;

  // Lưu lại guestCart đã chuẩn hóa
  res.cookie("guestCart", JSON.stringify(guestCart), {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
  });

  return next();
};

/**
 * Middleware 2: Gắn thêm thông tin sản phẩm đầy đủ vào cart
 */
module.exports.getCartWithInfoProducts = async (req, res, next) => {
  const userToken = req.cookies.userToken;
  let cart = null;

  if (userToken && res.locals.user) {
    // ✅ User login → lấy cart từ DB
    cart = await Carts.findOne({ userId: res.locals.user._id });
    if (cart) {
      res.clearCookie('guestCart'); // login thì không dùng guestCart
    }
  }

  // ❌ Nếu không có cart (guest hoặc chưa có DB)
  if (!cart) {
    const rawCart = req.cookies.guestCart || "";
    cart = await validateGuestCart(rawCart);
  }

  if (!cart) {
    cart = { products: [], totalQuantity: 0 };
    console.warn("⚠️ Not found cart!");
  }

  // ✅ Thêm thông tin sản phẩm đầy đủ
  const cartWithInfo = await addInfoProductInCart(cart);

  res.locals.cart = cartWithInfo;

  return next();
};
