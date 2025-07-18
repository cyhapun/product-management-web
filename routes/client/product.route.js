const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/products.controller');

module.exports = router;

// [GET] /products
router.get('/', controller.index);    

// [GET] /products/detail/:slugProduct
router.get('/detail/:slugProduct', controller.detail);

// [GET] /products/:slugProductCategory
router.get('/:slugProductCategory', controller.getProductsByCategory);