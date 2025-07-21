const router = require('express').Router();
const controllers = require('../../controllers/client/carts.controller');

// [GET] 'cart'
router.get('/', controllers.index);

// [POST] 'cart/add/:productId'
router.post('/add/:productId', controllers.addPost);

module.exports = router;