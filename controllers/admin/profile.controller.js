const Accounts = require('../../models/account.model');
const md5 = require('md5'); // Import md5 for password hashing
const systemConfig = require('../../config/system.js');

module.exports.index = (req, res) => {
  res.render('./admin/pages/profile/index.pug', {
    pageTitle: 'Profile',
  });
}

module.exports.updateProfile = (req, res) => {
  res.render('./admin/pages/profile/edit.pug', {
    pageTitle: 'Edit Profile',
  });
}

module.exports.updateProfilePatch = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (req.body.currentPassword) {
      // Check current password
      const account = await Accounts.findOne({ token: token, deleted: false });
      if (!account || account.password !== md5(req.body.currentPassword)) {
        req.flash('error', 'Current password is incorrect.');
        return res.redirect(req.get("Referrer") || "/");
      }
      
      if (req.body.newPassword && req.body.newPassword !== req.body.confirmPassword) {
        req.flash('error', 'New password and confirmation do not match.');
        return res.redirect(req.get("Referrer") || "/");
      }
      req.body.password = req.body.newPassword;
    }
    const emailExists = await Accounts.findOne({ email: req.body.email, token: { $ne: token }, deleted: false });
    if (emailExists) {
      req.flash('error', 'Email already exists. Please use a different email.');
      return res.redirect(req.get("Referrer") || "/");
    }
    await Accounts.updateOne({token: token, deleted:false}, req.body);
    req.flash('success', 'Profile updated successfully.');
  }
  catch (error) {
    req.flash('error', 'Failed to update profile. Please try again.');
    return res.redirect(req.get("Referrer") || "/");
  }
  res.redirect(`${systemConfig.prefixAdmin}/profile/edit`);
}