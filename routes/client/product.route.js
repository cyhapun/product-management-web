const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/products.controller');

module.exports = router;

// [GET] /products
router.get('/', controller.index);    

// [GET] /products/:id
router.get('/:id', controller.detail);