/**
 * Payment Service — Centralized API layer for all payment operations.
 * Handles Razorpay order creation, verification, and payment history.
 */
import api from '../utils/axios';

const paymentService = {
    /**
     * Create a Razorpay order for an event.
     * Returns order details needed to open Razorpay checkout.
     */
    createOrder: async (eventId, bookingType = 'booking') => {
        const { data } = await api.post('/payments/create-order', { eventId, bookingType });
        return data;
    },

    /**
     * Verify Razorpay payment after user completes checkout.
     */
    verifyPayment: async (paymentData) => {
        const { data } = await api.post('/payments/verify', paymentData);
        return data;
    },

    /**
     * Generate UPI QR code data for an order.
     */
    generateUpiQr: async (orderId, amount) => {
        const { data } = await api.post('/payments/upi-qr', { orderId, amount });
        return data;
    },

    /**
     * Get current user's payment history.
     */
    getMyPayments: async () => {
        const { data } = await api.get('/payments/my');
        return Array.isArray(data) ? data : [];
    },

    /**
     * Admin: Get all payments.
     */
    getAll: async () => {
        const { data } = await api.get('/payments/all');
        return Array.isArray(data) ? data : [];
    },

    /**
     * Admin: Get payment analytics.
     */
    getAnalytics: async () => {
        const { data } = await api.get('/payments/analytics');
        return data;
    },
};

export default paymentService;
