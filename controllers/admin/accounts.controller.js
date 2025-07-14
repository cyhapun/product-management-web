const Accounts = require('../../models/account.model.js'); 
const Roles = require('../../models/role.model.js');

// [GET] '/admin/accounts'
module.exports.index = async (req, res) => {
  try {
    // Fetch account list from the database
    const conditions = {
      deleted: false,
    }
    const accounts = await Accounts.find(conditions);

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
module.exports.postCreate = async (req, res) => {
  try {
    console.log('Creating new account with data:', req.body);
    const { fullName, email, password, phone, role_id, status } = req.body;

    // Create a new account instance
    const newAccount = new Accounts({
      fullName,
      email,
      password,
      phone,
      role_id,
      status,
    });

    // Save the account to the database
    // await newAccount.save();
    req.flash('success', `Create new account successfully!`);
  } catch (error) {
    console.error('Error creating account:', error);
    req.flash('error', `Create new account failed!`);
  }
  // Dùng để chuyển hướng (redirect) người dùng về trang trước đó hoặc chuyển hướng về trang chủ ("/") nếu không có trang trước.
  // Ngoài ra ta có thể fix cứng 1 trang web cụ thể
  res.redirect(req.get("Referrer") || "/admin/accounts");
}