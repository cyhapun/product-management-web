const uploadCloudinary = require('../../helpers/cloudinary');

module.exports.upload = async (req, res, next) => {
    if (req.file) {
         const imageUrl = await uploadCloudinary.uploadToCloudinary(req.file.buffer); 
        req.body[req.file.fieldname] = imageUrl; // Lưu URL ảnh vào req.body để gửi lên server   
    }
    next();
}