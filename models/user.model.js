const mongoose = require('mongoose');
const generateToken = require('../helpers/generateToken'); // Import the token generation helper
const md5 = require('md5'); // Import md5 for password hashing

// Create model mongoose
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: {
    type: String,
    set: (value) => {
      // Hash the password using md5 before saving
      return md5(value);
    }
  },
  userToken: {
    type: String,
    default: () => generateToken.generateToken(32) // Generate a token with a default length of 32
  },
  phone: String,
  avatar: String,
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  deletedDate: Date,
}, {
  timestamps:true
});
// Trường timestamps sẽ tự động thêm 2 thuộc tính updatedAt và createdAt cho từng document.

const User = mongoose.model('User', userSchema, "users");
// End create model mongoose

module.exports = User;