const router = require('express').Router();
const controllers = require('../../controllers/admin/profile.controller');
const validates = require('../../validates/admin/profile.validate');

// Package dùng để upload ảnh
const multer  = require('multer');
const uploadCloud = require('../../middlewares/admin/uploadCloud.middleware');
const upload = multer();

// [GET] /admin/profile
router.get('/', controllers.index);

// [GET] /admin/profile/edit
router.get('/edit', controllers.updateProfile);

// [PATCH] /admin/profile/edit
router.patch('/edit', 
  upload.single('avatar'), // Upload avatar
  validates.updateProfilePatch, // Validate profile data
  uploadCloud.upload, // Upload to cloud
  controllers.updateProfilePatch); // Handle profile update

module.exports = router;
