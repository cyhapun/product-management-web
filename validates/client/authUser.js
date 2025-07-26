const Users = require('../../models/user.model');
const md5 = require('md5');

module.exports.validateLogin = async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Kiểm tra rỗng
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please enter email and password!',
    });
  }

  // 2. Tìm user theo email
  const user = await Users.findOne({ email:email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'User not found!',
    });
  }
  if (user.status === 'inactive') {
    return res.status(400).json({
      success:false,
      message: 'Account is inactive!',
    });
  }

  // 3. Kiểm tra trạng thái tài khoản
  if (user.status === 'inactive') {
    return res.status(403).json({
      success: false,
      message: 'Account is inactive. Please contact support!',
    });
  }
  if (user.status === 'banned') {
    return res.status(403).json({
      success: false,
      message: 'Account has been banned!',
    });
  }

  // 4. Kiểm tra mật khẩu
  const hashedPassword = md5(password);
  if (user.password !== hashedPassword) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password!',
    });
  }

  // ✅ Lưu user vào req để route xử lý tiếp
  req.user = user;
  next();
}

module.exports.validateRegister = async (req, res, next) => {
  const { fullName, email, password, confirmPassword } = req.body;
  console.log(req.body);  
  // 1. Kiểm tra rỗng
  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required!',
    });
  }

  // 2. Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format!',
    });
  }

  // 3. Kiểm tra độ dài mật khẩu
  if (password.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 2 characters!',
    });
  }

  // 4. Kiểm tra confirmPassword
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match!',
    });
  }

  // 5. Kiểm tra email đã tồn tại chưa
  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered!',
    });
  }

  // ✅ Nếu hợp lệ → next()
  next();
}

module.exports.validateEmail = (req, res, next) => {
  const email = req.body.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    req.flash('error', 'Email empty!');
    return res.redirect('/user/password/forgot');
  }
  if (!emailRegex.test(email)) {
    req.flash('error', 'Email invalid!');
    return res.redirect('/user/password/forgot');
  }
  next();
}

module.exports.validateResetPassword= async (req, res, next) => {
  try {
    const {newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      req.flash('error', 'Passwords do not match!');
      return res.redirect(`/user/password/reset/${req.params.userToken}`);
    }

    if (newPassword.trim().length < 3) {
      req.flash('error', 'Password must be at least 3 characters long!');
      return res.redirect(`/user/password/reset/${req.params.userToken}`);
    }

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    return res.redirect('/user/password/forgot');
  }
  next();
};

module.exports.validateUser = (req, res, next) => {
  if (!res.locals.user) {
    return res.render('client/pages/404NotFound', {
      pageTitle:'Not found',
    });
  }
  next();
}
