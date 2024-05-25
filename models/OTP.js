
// server/models/User.js

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, expires: '5m', default: Date.now } // OTP expires in 5 minutes
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
