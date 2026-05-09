const mongoose = require('mongoose');

/**
 * Booking Schema — Tracks event bookings/participations.
 * Enhanced with payment tracking, unique booking IDs, and booking type.
 */
const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    bookingId: { type: String, unique: true },            // Unique human-readable booking ID (e.g., EVT-20260510-A3F2)
    bookingType: {
        type: String,
        enum: ['booking', 'participation'],
        default: 'booking'
    },
    status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'not_paid', 'refunded'], default: 'not_paid' },
    paymentMethod: { type: String, default: null },       // upi, card, netbanking, wallet, free
    transactionId: { type: String, default: null },       // Links to Payment.transactionId
    amount: { type: Number, required: true },
    bookedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate bookings: one active booking per user per event
bookingSchema.index({ userId: 1, eventId: 1 });

// Generate unique booking ID before saving
bookingSchema.pre('save', function (next) {
    if (!this.bookingId) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.bookingId = `EVT-${dateStr}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
