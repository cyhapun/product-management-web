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
module.exports.createPost = async (req, res) => {
  const role = new Roles(req.body);
  
  role.save();

  // Thông báo thành công:
  req.flash('success', `Thêm sản phẩm thành công!`);
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/");
}

// [GET] '/admin/roles/edit/:id'
module.exports.editRole = async (req, res) => {
  try {
    const condition = {
      deleted: false,
      _id: req.params.id,
    }

    const role = await Roles.findOne(condition);
    
    res.render('./admin/pages/roles/edit', {
      pageTitle: 'Edit role',
      role: role
    });
  }
  catch (error) {
    req.flash("error", "Role is undefined!")
    return res.redirect(req.get("Referrer") || "/admin/roles");
  }
}

// [PATCH] /admin/roles/edit/:id
module.exports.editRoleMethodPatch = async (req, res) => {
  try {
    const roleId = req.params.id;
    await Roles.updateOne({_id:roleId}, req.body);
  }
  catch (error) {
    req.flash("error", "Role is undefined!")
    return res.redirect(req.get("Referrer") || "/admin/roles");
  }

  // // Thông báo thành công:
  req.flash('success', `Update role successfully!`);
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/admin/roles");
}