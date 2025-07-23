const Users = require('../../models/user.model');
const Carts = require('../../models/cart.model');
const Products = require('../../models/product.model');
const { validateGuestCart } = require('../../helpers/client/cart');

// [GET] '/user/login'
module.exports.login = (req, res) => {
  res.render('client/pages/user/login.pug',{
    pageTitle: "Login",
  });
}

// [GET] '/user/register'
module.exports.register = (req, res) => {
  res.render('client/pages/user/register.pug',{
    pageTitle: "Register",
  });
}

// [POST] '/user/login' - AJAX
module.exports.loginPost = async (req, res) => {
  if (!req.user) {
    return res.status(400).json({
      success: false,
      message: 'User not found!',
    });
  }
  let cart = await Carts.findOne({userId:req.user._id});
  if (!cart) {
    cart = new Carts({userId: req.user._id});
  }
  // Copy guestCart nếu tồn tại và user chưa có sản phẩm
  if (req.cookies.guestCart && (!cart.products || cart.products.length === 0)) {
    try {
        const guestCart = await validateGuestCart(req.cookies.guestCart);

        if (guestCart.products && guestCart.products.length > 0) {
          cart.products = guestCart.products.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          }));
          cart.totalPrice = guestCart.totalPrice;
          cart.totalQuantity = guestCart.totalQuantity;
        }
      } catch (err) {
      console.warn('Lỗi khi đọc guestCart:', err.message);
    }
  }
  await cart.save();
  // Xóa guestCart cookie sau khi merge
  res.clearCookie('guestCart');
  // Set cookie an toàn
  res.cookie("userToken", req.user.userToken, {
    httpOnly: true,      // ✅ Ngăn JS truy cập cookie (chống XSS)
    secure: true,        // ✅ Bắt buộc HTTPS (nếu dùng HTTPS)
    sameSite: "strict",  // ✅ Chống CSRF
    maxAge: 1 * 24 * 60 * 60 * 1000 // ✅ 7 ngày
  });
  return res.send({
    success:true,
  });
}

// [POST] '/user/register' - AJAX
module.exports.registerPost = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const newUser = new Users({ fullName, email, password });
    await newUser.save();
    const cart = new Carts({userId:newUser._id});
    cart.save();
    res.json({ success:true});
  } catch (error) {
    res.status(500).json({ success:false, message: 'Server error!' });
  }
}