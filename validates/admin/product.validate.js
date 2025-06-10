module.exports.createPost = (req, res, next) => {
  if (!req.body.title) {
    req.flash("error", "Title is empty!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }
  next();
}