const router = require('express').Router();
const controllers = require('../../controllers/client/carts.controller');

// [GET] '/cart'
router.get('/', controllers.index);

// [POST] '/cart/add/:productId'
router.post('/add/:productId', controllers.addPost);

// [GET] '/cart/delete/:productId'
router.get('/delete/:productId', controllers.deleteProduct);

module.exports = router;