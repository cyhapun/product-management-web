const cloudinary = require('cloudinary').v2; // Dùng để upload ảnh lên Cloudinary
const streamifier = require('streamifier'); // Dùng để chuyển đổi buffer thành stream

// Configuration Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME_CLOUDINARY, 
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY
});
// End configuration Cloudinary

let = streamUpload = (buffer) => {
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
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports.uploadToCloudinary = async (buffer) => {
    let result = await streamUpload(buffer);
    return result.secure_url;
}
