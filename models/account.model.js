const mongoose = require('mongoose');
const generateToken = require('../helpers/generateToken'); // Import the token generation helper

// Create model mongoose
const accountSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  token: {
    type: String,
    default: () => generateToken.generateToken(32) // Generate a token with a default length of 32
  },
  phone: String,
  avatar: String,
  roleId: String,
  status: String,  
  deleted: { type: Boolean, default: false },
  position: Number,
  deletedDate: Date,
}, {
  timestamps:true
});
// Trường timestamps sẽ tự động thêm 2 thuộc tính updatedAt và createdAt cho từng document.

const Account = mongoose.model('Account', accountSchema, "accounts");
// End create model mongoose

module.exports = Account;