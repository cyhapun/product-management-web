const uploadCloudinary = require('../../helpers/cloudinary');
const Chats = require('../../models/chat.model');

module.exports = (res) => {
    const userId = res.locals.user._id;
    const fullName = res.locals.user.fullName;

    _io.once('connection', async (socket) => {
        // Server receive message from client
        socket.on("CLIENT_SEND_MESSAGE", async (data) => {
            // Upload images to Cloudinary
            let imageUrls = [];

            for(let imageBuffer of data.images) {
                let url = await uploadCloudinary.uploadToCloudinary(imageBuffer);
                imageUrls.push(url);
            }
            // End upload images to Cloudinary
            
            // Save messages from client
            const chat = new Chats({
                userId: userId,
                content: data.content,
                images: imageUrls,
            });
            await chat.save();
            // End save messages from client

            // Inform to all user
            _io.emit("SERVER_RETURN_MESSAGE", {
                userId: userId,
                fullName: fullName,
                content: data.content,
                images: imageUrls,
            });
        });

        // Server receive typing status from client
        socket.on("CLIENT_TYPING", (type) => {
            _io.emit("SERVER_RETURN_TYPING", {
                userId: userId,
                fullName: fullName,
                type: type, // "on" hoặc "off"
            });
        });
    });
}