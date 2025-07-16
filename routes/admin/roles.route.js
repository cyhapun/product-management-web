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

router.get('/permissions', controller.permissions);

router.patch('/permissions', controller.permissionsPatch);

module.exports = router;