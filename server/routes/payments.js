const express = require('express');
const router = express.Router();
const {
    createOrder,
    generateUpiQr,
    verifyPayment,
    webhook,
    getMyPayments,
    getAllPayments,
    getPaymentAnalytics
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validators');

// ── User Routes ──
router.post('/create-order', protect, validate.createOrder, createOrder);
router.post('/upi-qr', protect, validate.generateUpiQr, generateUpiQr);
router.post('/verify', protect, validate.verifyPayment, verifyPayment);
router.get('/my', protect, getMyPayments);

// ── Admin Routes ──
router.get('/all', protect, admin, getAllPayments);
router.get('/analytics', protect, admin, getPaymentAnalytics);

// ── Webhook (no auth — Razorpay server-to-server) ──
router.post('/webhook', webhook);

module.exports = router;
