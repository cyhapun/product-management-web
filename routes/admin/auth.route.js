const router = require('express').Router();
const controller = require('../../controllers/admin/auth.controller');
const validator = require('../../validates/admin/auth.validate');

// [GET] '/admin/auth/login'
router.get('/login', controller.login);

// [POST] '/admin/auth/login'
router.post('/login', 
  validator.authLogin,
  controller.loginPost);

module.exports = router;