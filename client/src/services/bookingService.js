/**
 * Booking Service — Centralized API layer for all booking operations.
 */
import api from '../utils/axios';

const bookingService = {
    /**
     * Get all bookings (admin-only).
     */
    getAll: async () => {
        const { data } = await api.get('/bookings/all');
        return Array.isArray(data) ? data : [];
    },

    /**
     * Get current user's bookings.
     */
    getMine: async () => {
        const { data } = await api.get('/bookings/my');
        return Array.isArray(data) ? data : [];
    },

    /**
     * Confirm a pending booking (admin-only).
     */
    confirm: async (id, paymentStatus) => {
        const { data } = await api.put(`/bookings/${id}/confirm`, { paymentStatus });
        return data;
    },

    /**
     * Cancel / reject a booking.
     */
    cancel: async (id) => {
        const { data } = await api.delete(`/bookings/${id}`);
        return data;
    },

    /**
     * Send booking OTP to current user's email.
     */
    sendOTP: async () => {
        const { data } = await api.post('/bookings/send-otp');
        return data;
    },

    /**
     * Book an event with OTP verification.
     */
    book: async (eventId, otp) => {
        const { data } = await api.post('/bookings', { eventId, otp });
        return data;
    },
};

export default bookingService;
