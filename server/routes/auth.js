const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, resendOTP, forgotPassword, verifyResetOTP, resetPassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

router.put('/profile', protect, updateProfile);

module.exports = router;
