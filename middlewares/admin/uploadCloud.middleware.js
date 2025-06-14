const cloudinary = require('cloudinary').v2; // Dùng để upload ảnh lên Cloudinary
const streamifier = require('streamifier'); // Dùng để chuyển đổi buffer thành stream

// Configuration Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME_CLOUDINARY, 
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY
});
// End configuration Cloudinary

module.exports.upload = (req, res, next) => {
    if (!req.file) {
        return next();
    }
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        req.body[req.file.fieldname] = result.secure_url; // Lưu URL ảnh vào req.body để gửi lên server
        next();
    }

    upload(req);
}