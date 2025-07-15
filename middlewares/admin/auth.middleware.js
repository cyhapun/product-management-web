const systemConfig = require('../../config/system');
const Accounts = require('../../models/account.model');
const Roles = require('../../models/role.model');

module.exports.requireAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const user = await Accounts.findOne({ token: token, deleted:false}).select('-password');
    if (!user) {
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }
    const role = await Roles.findOne({ _id: user.roleId, deleted: false }).select('title permissions');

    res.locals.user = user;
    res.locals.role = role;

    return next();
  }
  return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}