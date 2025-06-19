const router = require('express').Router();
const controller = require('../../controllers/admin/roles.controller');
const validate = require('../../validates/admin/roles.validate')
router.get('/', controller.index);

router.get('/create', controller.create);

router.post('/create', 
  validate.createNewRole,
  controller.createPost);

router.get('/edit/:id', controller.editRole);

router.patch('/edit/:id', 
  validate.createNewRole,
  controller.editRoleMethodPatch);

module.exports = router;