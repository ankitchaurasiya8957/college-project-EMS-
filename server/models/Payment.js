const mongoose = require('mongoose');

/**
 * Payment Schema — Stores all Razorpay payment records.
 * Linked to both User and Event for complete traceability.
 */
const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },

    // Razorpay specific fields
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    amount: { type: Number, required: true },           // Amount in INR (rupees)
    currency: { type: String, default: 'INR' },
    paymentStatus: {
        type: String,
        enum: ['created', 'paid', 'failed', 'refunded'],
        default: 'created'
    },
    paymentMethod: { type: String, default: null },      // upi, card, netbanking, wallet etc.
    transactionId: { type: String, default: null },      // Unique generated transaction ID
    receipt: { type: String, default: null },             // Razorpay receipt reference
    notes: { type: mongoose.Schema.Types.Mixed, default: {} },
    paidAt: { type: Date, default: null },
}, { timestamps: true });

// Index for fast lookup
paymentSchema.index({ userId: 1, eventId: 1 });
// Note: razorpayOrderId index is already created by `unique: true` on the field definition
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
