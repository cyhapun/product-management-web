const multer = require('multer');

module.exports = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Lưu ý tính từ folder cao nhất đi vào trong.
      cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      // Trường file chính là req.file ở controller.
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  });
  return storage;
};