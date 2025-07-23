const Users = require('../../models/user.model');

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
  res.cookie("UserToken", req.user.userToken);
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
    res.json({ success:true});
  } catch (error) {
    res.status(500).json({ success:false, message: 'Server error!' });
  }
}