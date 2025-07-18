const Roles = require('../../models/role.model')

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
  if (!res.locals.role.permissions.includes("role-permission_create")) {
    return res.send("Can not do this!");
  }
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
  if (!res.locals.role.permissions.includes("role-permission_edit")) {
    return res.send("Can not do this!");
  }
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

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
  const condition = {
    deleted: false,
  };
  const roles = await Roles.find(condition);
  
  res.render('./admin/pages/roles/permissions', {
    pageTitle: 'Edit permission',
    roles: roles
  })
}

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
  if (!res.locals.role.permissions.includes("role-permission_assignment")) {
    return res.send("Can not do this!");
  }
  const rolePermission = req.body.rolePermission;

  for (const role of rolePermission) {
    try {
      await Roles.updateOne({_id: role.id}, {permissions: role.permissions});
    } 
    catch (err) {
      console.log("Error when updating role: ", err);
      req.flash('success', `Update role successfully!`);  
      res.status(500).json({ message: 'Update role failed!' });
    }
  }

  // Thông báo thành công:
  req.flash('success', `Update role successfully!`);
  // Do dùng fetch ở phía frontend để gữi yêu cầu nên ta cần phải gữi phản hồi lại dạng này để phía frontend biết đã thành công
  res.json({ message: 'Update role successfully!' });
}