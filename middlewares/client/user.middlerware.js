const Users = require('../../models/user.model');

module.exports.addInfoUser = async (req, res, next) => {
  
  if (req.cookies.userToken) {
    const user = await Users.findOne({
      deleted:false,
      userToken: req.cookies.userToken,
      status:'active',
    });
    if (user) {
      res.locals.user = user;
    }
  }
  next();
}