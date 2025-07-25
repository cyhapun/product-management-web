const mongoose = require('mongoose');
const timeExisted = 60 * 3; // 3 phút
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
    default: () => new Date(Date.now() + timeExisted * 1000), // Corrected line: Use Date.now() and create a new Date object
    expires: 0, // TTL ngay khi đến expireAt
    index: true
  },
}, {
  timestamps: true
});
ForgotPasswordSchema.index({ "expireAt": 1 }, { expireAfterSeconds: 0 });
const ForgotPassword = mongoose.model('ForgotPassword', ForgotPasswordSchema, 'forgot-password');

module.exports = ForgotPassword;