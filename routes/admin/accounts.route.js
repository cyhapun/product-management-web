const router = require('express').Router();
const controller = require('../../controllers/admin/accounts.controller');
const validate = require('../../validates/admin/account.validate');
// Package dùng để upload ảnh
const multer  = require('multer');
const uploadCloud = require('../../middlewares/admin/uploadCloud.middleware');
const upload = multer();

router.get('/', controller.index);

router.get('/create', controller.create);

router.post('/create',
  upload.single('avatar'), // Sử dụng multer để upload file ảnh
  validate.createPost,
  uploadCloud.upload,
  controller.createPost);

router.get('/edit/:id', controller.edit);

router.patch('/edit/:id',
  upload.single('avatar'), // Sử dụng multer để upload file ảnh
  validate.editPatch,
  uploadCloud.upload,
  controller.editPatch);

module.exports = router;