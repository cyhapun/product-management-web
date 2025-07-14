module.exports.authLogin = async (req, res) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    req.flash('error', 'Email and password are required!');
    return res.redirect('/admin/auth/login');
  }
}