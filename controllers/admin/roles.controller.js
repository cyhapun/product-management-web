const Roles = require('../../models/roles')

// [GET] '/admin/roles/'
module.exports.index = async (req, res) => {
  const condition = {
    deleted: false,
  };
  const roles = await Roles.find(condition);
  
  res.render('./admin/pages/roles/index', {
    pageTitle: 'Role Groups',
    records: roles
  });
}

// [GET] '/admin/roles/create/'
module.exports.create = (req, res) => {
  res.render('./admin/pages/roles/create', {
    pageTitle: 'Create new role',
  });
}

// [POST] '/admin/roles/create/'
module.exports.createPost = (req, res) => {
  const role = new Roles(req.body);
  
  role.save();

  // Thông báo thành công:
  req.flash('success', `Thêm sản phẩm thành công!`);
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/");
}