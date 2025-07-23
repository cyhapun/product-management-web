const Users = require('../../models/user.model');

module.exports.addInfoUser = async (req, res, next) => {
  console.log('user middleware:', req.cookies.userToken);
  
  if (req.cookies.userToken) {
    const user = await Users.findOne({
      deleted:false,
      userToken: req.cookies.userToken,
      status:'active',
    });
    console.log('user middleware: ', user);
    if (user) {
      res.locals.user = user;
    }
  }
  next();
}