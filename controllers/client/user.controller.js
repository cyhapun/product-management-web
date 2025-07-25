const Users = require('../../models/user.model');
const Carts = require('../../models/cart.model');
const { validateGuestCart } = require('../../helpers/client/cart');
const ForgotPassword = require('../../models/forgotPassword.model');
const UserHelpers = require('../../helpers/client/user');
const Orders = require('../../models/order.model');

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
    // secure: true,        // ✅ Bắt buộc HTTPS (nếu dùng HTTPS)
    // sameSite: "strict",  // ✅ Chống CSRF
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

// [GET] '/user/profile' 
module.exports.profile = (req, res) => {
  if (!res.locals.user) {
    res.render("client/pages/404NotFound",{
      pageTitle:"Not found profile",
    });
  }
  res.render('client/pages/user/profile', {
    pageTitle: 'Profile',
    currentPath: req.originalUrl,
  });
}

// [GET] '/user/logout'
module.exports.logout = (req, res) => {
  res.clearCookie('userToken');
  req.flash('success', 'Logout successfully!');
  res.redirect('/');
}

// [GET] '/user/password/forgot'
module.exports.forgotPassword = (req, res) => {
  res.render('client/pages/user/forgotPassword', {
    pageTitle: 'Forgot password',
  })
}

// [POST] '/user/password/forgot'
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;
  
  if (!email) {
    req.flash('error', 'Email is empty!');
    return res.redirect('/user/password/forgot');
  }

  const user = await Users.findOne({
    deleted:false,
    status:'active',
    email: email,
  });

  if (!user) {
    req.flash('error', 'Email is not existed!');
    return res.redirect('/user/password/forgot');
  }
  
  const otp = new ForgotPassword({email});

  await otp.save();
  
  const subjectEmail = 'Mã OTP xác thực từ CYHAPUN';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Your OTP Code</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f4f4f4;
          padding: 0;
          margin: 0;
        }
        .container {
          max-width: 500px;
          margin: 30px auto;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 30px;
          text-align: center;
        }
        h2 {
          color: #333;
        }
        .otp-box {
          background: #f0f7ff;
          padding: 15px;
          border-radius: 6px;
          display: inline-block;
          font-size: 22px;
          font-weight: bold;
          letter-spacing: 4px;
          color: #1a73e8;
          margin: 15px 0;
        }
        p {
          color: #555;
          font-size: 15px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Your Verification Code</h2>
        <p>We received a request to verify your account. Please use the following OTP:</p>
        
        <div class="otp-box">${otp.otp}</div>
        
        <p>This code will expire in <strong>2 minutes</strong>.  
          If you did not request this, you can safely ignore this email.</p>
        
        <div class="footer">
          &copy; 2025 Cyhapun
        </div>
      </div>
    </body>
    </html>
  `;

  UserHelpers.sendMail(
    email,
    subjectEmail,
    htmlContent,
  );

  req.flash('success', "Sent to your email!");
  return res.redirect(`/user/password/otp?email=${email}`);
}

// [GET] '/user/password/otp'
module.exports.passwordOTP = async (req, res) => {
  // const email = await ForgotPassword.findOne({
  //   email: req.query.email,
  // });
  // if (!email) {
  //   return res.render('client/pages/404NotFound', {
  //     pageTitle: "Not found OTP email",
  //   });
  // }
  res.render('client/pages/user/otpForgotPassword',{
    pageTitle: 'Verify OTP',
    email:req.query.email,
  })
}

// [POST] '/user/password/otp'
module.exports.passwordOTPPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4
  const otpEmail = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });
  if (!otpEmail) {
    req.flash('error', 'OTP is not correct!');
    return res.redirect('back');
  }
  const user = await Users.findOne({
    deleted:false,
    email:email,
    status:'active',
  });
  res.cookie('resetEmail', email);
  return res.redirect(`/user/password/reset/${user.userToken}`);
}

// [GET] '/user/password/reset/:userToken'
module.exports.resetPassword = (req, res) => {
  const email = req.cookies.resetEmail;
  res.clearCookie('resetEmail');
  res.render('client/pages/user/resetPassword', {
    pageTitle: 'Reset password',
    userToken: req.params.userToken,
    email: email,
  });
}

// [POST] '/user/password/reset/:userToken'
module.exports.resetPasswordPost = async (req, res) => {
  const userToken = req.params.userToken;
  const password = req.body.newPassword;
  const user = await Users.findOne({userToken, deleted: false, status: 'active' });
  
  if (!user) {
    res.clearCookie('userToken');
    req.flash('error', 'Account not found!');
    return res.redirect('/user/password/forgot');
  }
  await Users.updateOne({userToken}, {password:password});
  await ForgotPassword.deleteMany({
    email:req.body.email,
  });
  req.flash('success', 'Your password has been updated! Please login.');
  return res.redirect('/user/login');
}

// [GET] '/user/order/history'
module.exports.orderHistory = async (req, res) => {
  const orders = await Orders.find({
    userId: res.locals.user._id,
  });

  res.render('client/pages/user/orderHistory', {
    pageTitle:'Order history',
    orders: orders,
    currentPath: req.originalUrl,
  });
}

// [GET] 'user/settings'
module.exports.settings = (req, res) => {
  res.render('client/pages/user/settings', {
    pageTitle:'Settings',
    currentPath: req.originalUrl,
  });
}