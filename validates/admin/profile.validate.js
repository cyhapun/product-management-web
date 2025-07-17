module.exports.updateProfilePatch = (req, res, next) => {
  if (!req.body.fullName) {
    req.flash("error", "Full Name is required!");
    res.redirect(req.get("Referrer") || "/admin/profile/edit");
    return;
  }
  if (!req.body.email) {
    req.flash("error", "Email is required!");
    res.redirect(req.get("Referrer") || "/admin/profile/edit");
    return;
  }
  if (req.body.currentPassword != '' && req.body.newPassword == '') {
    req.flash("error", "New Password is required when changing password!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }
  next();
}