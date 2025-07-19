const router = require('express').Router();
const controllers = require('../../controllers/client/search.controller');

// [GET] /search
router.get('/', controllers.index);

module.exports = router;