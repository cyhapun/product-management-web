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
  const user = await Users.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'User not found!',
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

