const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, resendOTP, forgotPassword, verifyResetOTP, resetPassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validators');

// ── Public Auth Routes ──
router.post('/register', validate.register, register);
router.post('/login', validate.login, login);
router.post('/verify-otp', validate.verifyOTP, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', validate.forgotPassword, forgotPassword);
router.post('/verify-reset-otp', validate.verifyOTP, verifyResetOTP);
router.post('/reset-password', validate.resetPassword, resetPassword);

// ── Protected Routes ──
router.put('/profile', protect, validate.updateProfile, updateProfile);

module.exports = router;
