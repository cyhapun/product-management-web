const Accounts = require('../../models/account.model.js'); 
const Roles = require('../../models/role.model.js');
const systemConfig = require('../../config/system');

// [GET] '/admin/accounts'
module.exports.index = async (req, res) => {
  try {
    // Fetch account list from the database
    const conditions = {
      deleted: false,
    }
    const accounts = await Accounts.find(conditions).select("-password -token");
    
    for (let account of accounts) {
      const role = await Roles.findOne({_id: account.roleId, deleted:false});
      account.role = role ? role.title : 'No Role Assigned';
    }

    res.render('./admin/pages/accounts/index.pug', { 
      pageTitle: 'Accounts Management',
      accounts: accounts, 
    });
  } catch (error) {
    console.error('Error fetching account list:', error);
    res.status(500).send('Internal Server Error');
  }
}

// [GET] '/admin/accounts/create'
module.exports.create = async (req, res) => {
  const roles = await Roles.find({ deleted: false });

  res.render('./admin/pages/accounts/create.pug', { 
    pageTitle: 'Create Account',
    roles: roles,
  });
}

// [POST] '/admin/accounts/create'
module.exports.createPost = async (req, res) => {
  try {
    const emailExists = await Accounts.findOne({ email: req.body.email, deleted: false });
    if (emailExists) {
      req.flash('error', `Email ${req.body.email} already exists!`);
      return res.redirect(req.get("Referrer") || "/admin/accounts/create");
    }
    // Create a new account instance
    const newAccount = new Accounts(req.body);
    
    // Save the account to the database
    await newAccount.save();
    req.flash('success', `Create new account successfully!`);
  } catch (error) {
    console.error('Error creating account:', error);
    req.flash('error', `Create new account failed!`);
  }
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/admin/accounts");
}

// [GET] '/admin/accounts/edit/:id'
module.exports.edit = async (req, res) => {
  try {
    const accountId = req.params.id;
    const account = await Accounts.findOne({_id:accountId, deleted: false });
    const roles = await Roles.find({deleted: false }); 

    res.render('./admin/pages/accounts/edit.pug', { 
      pageTitle: 'Edit Account',
      account: account,
      roles: roles,
    });
  }
  catch (error) {
    console.error('Error fetching account for edit:', error);
    req.flash('error', `Error fetching account for edit!`);
    return res.redirect(req.get("Referrer") || "/admin/accounts");
  }
}

// [PATCH] '/admin/accounts/edit/:id'
module.exports.editPatch = async (req, res) => {
  try {
    const emailExists = await Accounts.findOne({_id: { $ne: req.params.id }, email: req.body.email, deleted: false });
    if (emailExists) {
      req.flash('error', `Email ${req.body.email} already exists!`);
      return res.redirect(req.get("Referrer") || "/admin/accounts/edit/" + req.params.id);
    }
    if (req.body.password === '') {
      delete req.body.password; // If password is empty, do not update it
    }
    
    await Accounts.updateOne(
      { _id: req.params.id, deleted: false },
      req.body
    );

    req.flash('success', `Update account successfully!`);
  } catch (error) {
    console.error('Error creating account:', error);
    req.flash('error', `Update account failed!`);
  }
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/admin/accounts/edit/" + req.params.id);
}