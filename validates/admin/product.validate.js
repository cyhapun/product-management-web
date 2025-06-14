module.exports.createPost = (req, res, next) => {
  // Kiểm tra xem người dùng có nhập tiêu đề sản phẩm hay không
  if (!req.body.title) {
    req.flash("error", "Title is empty!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }
  next();
}