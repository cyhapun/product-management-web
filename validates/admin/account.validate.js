module.exports.createPost = (req, res, next) => {
  // Kiểm tra xem người dùng có nhập tiêu đề sản phẩm hay không
  if (!req.body.fullName) {
    req.flash("error", "Full name is empty!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }
  if (!req.body.email || req.body.email.trim() === '') {
    req.flash("error", "Email is empty!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }
  if (!req.body.password || req.body.password.trim() === '') {
    req.flash("error", "Password is empty!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }
  if (!req.body.roleId || req.body.roleId.trim() === '') {
    req.flash("error", "Role is empty!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }
  next();
}