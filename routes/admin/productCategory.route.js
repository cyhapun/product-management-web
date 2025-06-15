const router = require('express').Router();
const controller = require('../../controllers/admin/productCategory.controller')

router.get('/', controller.index);

module.exports = router