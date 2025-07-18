const router = require('express').Router();
const controller = require('../../controllers/admin/productCategory.controller');
const validate = require('../../validates/admin/productCategory.validate');
// Package dùng để upload ảnh
const multer  = require('multer');
const uploadCloud = require('../../middlewares/admin/uploadCloud.middleware');
const upload = multer();

router.get('/', controller.index);

router.get('/create-new', controller.createNewCategory)

router.post('/create-new',   
  upload.single('thumbnail'),
  uploadCloud.upload,
  validate.createNewCategoryMethodPost,
  controller.createNewCategoryMethodPost);

router.get('/modify-product-category/:id', controller.modifyCategory)

router.patch('/modify-product-category/:id',
  upload.single('thumbnail'),
  uploadCloud.upload,
  validate.createNewCategoryMethodPost,
  controller.modifyProductCategoryMethodPost);

module.exports = router