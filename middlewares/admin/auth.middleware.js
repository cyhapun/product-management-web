const systemConfig = require('../../config/system');
const Accounts = require('../../models/account.model');

module.exports.requireAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const user = await Accounts.findOne({ token: token, deleted:false});
    if (user) {
      return next();
    }
  }
  return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}