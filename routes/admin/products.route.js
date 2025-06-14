const controller = require('../../controllers/admin/products.controller');
const validate = require('../../validates/admin/product.validate');
const router = require('express').Router();
// Package dùng để upload ảnh
const multer  = require('multer');
const uploadCloud = require('../../middlewares/admin/uploadCloud.middleware');
const upload = multer();

router.get('/', controller.products);

// Dùng route động (:variable)
//- Tại sao ta dùng phương thức PATCH trong khi GET ta vẫn cập nhật được?
//- Do trình duyệt mặc định sử dụng GET mà khi người dùng truy cập vào đường dẫn ấy thì sẽ làm thay đổi dữ liệu của ta.
//- Do đó sử dụng PATCH để tránh bị việc này.
router.patch('/change-status/:status/:id', controller.changeStatus)

router.patch('/multi-change', controller.multiChange);

router.delete('/delete-product/:id', controller.deleteProduct);

router.get('/create-new', controller.createNewProduct);

router.post('/create-new', 
  upload.single('thumbnail'),
  uploadCloud.upload,
  validate.createPost,
  controller.createNewProductMethodPost);

router.get('/modify-product/:id', 
  controller.modifyProduct);

router.patch('/modify-product/:id', 
  upload.single('thumbnail'),
  uploadCloud.upload,
  validate.createPost,
  controller.modifyProductMethodPatch);

router.get('/detail-product/:id',controller.detailProduct);

module.exports = router;