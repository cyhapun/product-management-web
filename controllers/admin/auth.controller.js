const Accounts = require('../../models/account.model');
const systemConfig = require('../../config/system');

// [GET] /admin/auth/login
module.exports.login = async (req, res) => {
  if (req.cookies.token) {
    const user = await Accounts.findOne({ token: req.cookies.token, deleted: false });
    if (user) {
      req.flash('error', 'You are already logged in!');
      return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
    }
  }
  res.render('admin/pages/auth/login', {
    pageTitle: 'Admin Login',
  })  
}

// [POST] /admin/auth/login
module.exports.loginPost  = async (req, res) => {
  const { email, password } = req.body;
  const conditions = {
    email: email,
    password: password,
    deleted: false,
  };

  const user = await Accounts.findOne(conditions);
  
  if (!user) {
    req.flash('error', 'Invalid email or password!');
    return res.redirect('/admin/auth/login');
  }
  if (user.status === 'inactive') {
    req.flash('error', 'Your account is inactive. Please contact support.');
    return res.redirect('/admin/auth/login');
  }
  res.cookie('token', user.token, {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
  });
  req.flash('success', 'You have successfully logged in!');
  return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
}

// [GET] /admin/auth/logout
module.exports.logout = (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'You have successfully logged out.');
  return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}