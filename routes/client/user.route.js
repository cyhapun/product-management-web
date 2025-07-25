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

router.get('/profile', 
  validateUser.validateUser,
  controllers.profile);

router.get('/logout', controllers.logout);

router.get('/password/forgot', controllers.forgotPassword);

router.post('/password/forgot', 
  validateUser.validateEmail,
  controllers.forgotPasswordPost);

router.get('/password/otp', controllers.passwordOTP);

router.post('/password/otp', controllers.passwordOTPPost);

router.get('/password/reset/:userToken', controllers.resetPassword);

router.post('/password/reset/:userToken', 
  validateUser.validateResetPassword,
  controllers.resetPasswordPost);

router.get('/order/history', 
  validateUser.validateUser,
  controllers.orderHistory);

router.get('/settings', 
  validateUser.validateUser,
  controllers.settings);

module.exports = router;