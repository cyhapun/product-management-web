const mongoose = require('mongoose');
const timeExisted = 60 * 2; // 2 phút
const { generateOTP } = require('../helpers/client/user');

const ForgotPasswordSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    default: () => generateOTP(4), // tự sinh 4 số OTP mặc định
  },
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + timeExisted * 1000), // Hết hạn sau 2 phút
    expires: 0 // TTL ngay khi đến expireAt
  },
}, {
  timestamps: true
});

const ForgotPassword = mongoose.model('ForgotPassword', ForgotPasswordSchema, 'forgot-password');

module.exports = ForgotPassword;
