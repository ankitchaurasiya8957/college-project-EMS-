const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    action: { type: String, enum: ['account_verification', 'event_booking', 'password_reset'], required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

// Index for faster lookups
otpSchema.index({ email: 1, action: 1 });

// TTL index: MongoDB automatically deletes expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
