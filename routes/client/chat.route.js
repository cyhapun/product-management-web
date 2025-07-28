const router = require('express').Router();
const controllers = require('../../controllers/client/chat.controller');

// [GET] /chat
router.get('/', controllers.index);

module.exports = router;