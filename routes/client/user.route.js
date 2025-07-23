const router = require('express').Router();
const controllers = require('../../controllers/client/user.controller.js');
const validateUser = require('../../validates/client/authUser.js');

router.get('/login', controllers.login);

router.get('/register', controllers.register);

router.post('/login', 
  validateUser.validateLogin,
  controllers.loginPost);

router.post('/register', 
  validateUser.validateRegister,
  controllers.registerPost);

router.get('/profile', controllers.profile);

router.get('/logout', controllers.logout);

module.exports = router;