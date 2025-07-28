const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/settings.controller');

// Package dùng để upload ảnh
const multer  = require('multer');
const uploadCloud = require('../../middlewares/admin/uploadCloud.middleware');
const upload = multer();

router.get('/general', controller.generalSettings);

router.patch('/general', 
  upload.single('logo'),
  uploadCloud.upload,
  controller.generalSettingsPatch);

module.exports = router;