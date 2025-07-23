const express = require('express');
const router = express.Router();
const controllers = require('../../controllers/client/checkout.controller');
const validateOrder = require('../../validates/client/authOrder');

router.get('/', controllers.index);    

router.post('/order', 
  validateOrder,
  controllers.orderPost);    

router.get('/success/:orderId', controllers.success);

module.exports = router;