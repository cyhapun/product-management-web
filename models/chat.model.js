const mongoose = require('mongoose');

// Create model mongoose
const chatSchema = new mongoose.Schema({
  userId:String,
  roomChatId: String,
  content: String,
  images: Array,
  deleted: { type: Boolean, default: false },
  deletedAt: Date,
}, {
  timestamps:true
});
// Trường timestamps sẽ tự động thêm 2 thuộc tính updatedAt và createdAt cho từng document.

const Chat = mongoose.model('Chat', chatSchema, "chats");
// End create model mongoose

module.exports = Chat;