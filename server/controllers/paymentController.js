const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { sendBookingEmail } = require('../utils/email');

// ── Razorpay Instance ──
const rzpKeyId = (process.env.RAZORPAY_KEY_ID || '').trim();
const rzpKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

console.log(`💳 Razorpay initialized: key=${rzpKeyId.substring(0, 12)}...`);

const razorpay = new Razorpay({
    key_id: rzpKeyId,
    key_secret: rzpKeySecret,
});

/**
 * Generate a unique transaction ID
 * Format: TXN-YYYYMMDD-XXXXXX
 */
const generateTransactionId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `TXN-${date}-${random}`;
};

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order and stores a pending payment record.
 * Body: { eventId, bookingType }
 */
exports.createOrder = async (req, res) => {
    try {
        const { eventId, bookingType = 'booking' } = req.body;

        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        // Validate event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available for this event' });
        }

        // Check duplicate active booking
        const existingBooking = await Booking.findOne({
            userId: req.user.id,
            eventId,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            return res.status(400).json({
                message: 'You already have an active booking for this event',
                bookingId: existingBooking.bookingId
            });
        }

        // If event is free, directly create booking without Razorpay
        if (event.ticketPrice === 0) {
            const booking = await Booking.create({
                userId: req.user.id,
                eventId,
                bookingType,
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentMethod: 'free',
                amount: 0,
            });

            // Decrement available seats
            event.availableSeats -= 1;
            await event.save();

            // Send confirmation email
            await sendBookingEmail(req.user.email, req.user.name, event.title);

            console.log(`✅ Free booking confirmed: ${booking.bookingId} for "${event.title}"`);

            return res.status(201).json({
                message: 'Free event booked successfully!',
                booking,
                isFree: true,
            });
        }

        // Create Razorpay Order for paid events
        const transactionId = generateTransactionId();
        const amountInPaise = Math.round(event.ticketPrice * 100); // Razorpay uses paise

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: transactionId,
            notes: {
                eventId: event._id.toString(),
                eventTitle: event.title,
                userId: req.user.id,
                userName: req.user.name,
                bookingType,
            },
        });

        // Save pending payment record
        const payment = await Payment.create({
            userId: req.user.id,
            eventId,
            razorpayOrderId: razorpayOrder.id,
            amount: event.ticketPrice,
            transactionId,
            receipt: transactionId,
            paymentStatus: 'created',
            notes: razorpayOrder.notes,
        });

        console.log(`💳 Razorpay order created: ${razorpayOrder.id} | TXN: ${transactionId}`);

        res.status(201).json({
            orderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            keyId: rzpKeyId,
            transactionId,
            eventTitle: event.title,
            userName: req.user.name,
            userEmail: req.user.email,
            isFree: false,
        });
    } catch (error) {
        console.error('❌ Error creating order:', error.message);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
};

/**
 * POST /api/payments/upi-qr
 * Generates a UPI payment intent string for QR code display.
 * Body: { orderId, amount }
 */
exports.generateUpiQr = async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Order ID and amount are required' });
        }

        // Verify the order exists in our records
        const payment = await Payment.findOne({ razorpayOrderId: orderId, userId: req.user.id });
        if (!payment) {
            return res.status(404).json({ message: 'Payment order not found' });
        }

        // Build UPI intent string (standard UPI deep-link format)
        const upiId = process.env.UPI_MERCHANT_ID || 'eventora@razorpay';
        const merchantName = 'Eventora';
        const amountInRupees = (amount / 100).toFixed(2);
        const txnRef = payment.transactionId;

        const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent('Eventora-' + txnRef)}&tr=${encodeURIComponent(txnRef)}`;

        console.log(`📱 UPI QR generated for order: ${orderId}`);

        res.json({
            upiString,
            upiId,
            merchantName,
            amount: amountInRupees,
            transactionRef: txnRef,
            orderId,
        });
    } catch (error) {
        console.error('❌ Error generating UPI QR:', error.message);
        res.status(500).json({ message: 'Failed to generate UPI QR', error: error.message });
    }
};

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature, creates booking on success.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingType }
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingType = 'booking' } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('❌ Missing payment verification data:', req.body);
            return res.status(400).json({ message: 'Missing payment verification data' });
        }

        // ── Verify Signature using HMAC SHA256 ──
        const generatedSignature = crypto
            .createHmac('sha256', rzpKeySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            // Mark payment as failed
            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: 'failed' }
            );
            console.error(`⚠️  Payment signature mismatch! Order: ${razorpay_order_id}`);
            console.error(`   Expected: ${generatedSignature}`);
            console.error(`   Received: ${razorpay_signature}`);
            return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
        }

        // ── Signature valid — fetch payment record ──
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        if (payment.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Payment already verified' });
        }

        // Fetch Razorpay payment details to get payment method
        let paymentMethod = 'online';
        try {
            const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
            paymentMethod = rzpPayment.method || 'online'; // upi, card, netbanking, wallet
        } catch (e) {
            console.warn('⚠️  Could not fetch payment method:', e.message);
        }

        // ── Update payment record ──
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paymentStatus = 'paid';
        payment.paymentMethod = paymentMethod;
        payment.paidAt = new Date();
        await payment.save();

        // ── Create confirmed booking ──
        const event = await Event.findById(payment.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.availableSeats <= 0) {
            // Refund scenario - no seats left
            payment.paymentStatus = 'refunded';
            await payment.save();
            return res.status(400).json({ message: 'No seats available. Payment will be refunded.' });
        }

        const booking = await Booking.create({
            userId: payment.userId,
            eventId: payment.eventId,
            bookingType,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod,
            transactionId: payment.transactionId,
            amount: payment.amount,
        });

        // Link booking to payment
        payment.bookingId = booking._id;
        await payment.save();

        // Decrement available seats
        event.availableSeats -= 1;
        await event.save();

        // Send confirmation email
        const user = await require('../models/User').findById(payment.userId);
        if (user) {
            await sendBookingEmail(user.email, user.name, event.title);
        }

        console.log(`✅ Payment verified & booking confirmed: ${booking.bookingId} | TXN: ${payment.transactionId}`);

        res.json({
            message: 'Payment verified and booking confirmed!',
            booking,
            payment: {
                transactionId: payment.transactionId,
                amount: payment.amount,
                paymentMethod,
                paidAt: payment.paidAt,
            },
        });
    } catch (error) {
        console.error('❌ Payment verification error:', error.message);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
};

/**
 * POST /api/payments/webhook
 * Razorpay webhook handler for server-to-server payment confirmation.
 * This is a backup verification mechanism.
 */
exports.webhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook signature
        const signature = req.headers['x-razorpay-signature'];
        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (signature !== expectedSignature) {
                return res.status(400).json({ message: 'Invalid webhook signature' });
            }
        }

        const { event, payload } = req.body;

        if (event === 'payment.captured') {
            const paymentEntity = payload.payment.entity;
            const orderId = paymentEntity.order_id;

            const payment = await Payment.findOne({ razorpayOrderId: orderId });
            if (payment && payment.paymentStatus !== 'paid') {
                payment.razorpayPaymentId = paymentEntity.id;
                payment.paymentStatus = 'paid';
                payment.paymentMethod = paymentEntity.method;
                payment.paidAt = new Date();
                await payment.save();
                console.log(`🔔 Webhook: Payment captured for order ${orderId}`);
            }
        }

        if (event === 'payment.failed') {
            const paymentEntity = payload.payment.entity;
            const orderId = paymentEntity.order_id;

            await Payment.findOneAndUpdate(
                { razorpayOrderId: orderId },
                { paymentStatus: 'failed' }
            );
            console.log(`🔔 Webhook: Payment failed for order ${orderId}`);
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('❌ Webhook error:', error.message);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

/**
 * GET /api/payments/my
 * Get current user's payment history
 */
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id })
            .populate('eventId', 'title date location category image')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * GET /api/payments/all
 * Admin: Get all payments with full details
 */
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email')
            .populate('eventId', 'title date location category')
            .populate('bookingId', 'bookingId status')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * GET /api/payments/analytics
 * Admin: Payment analytics for dashboard
 */
exports.getPaymentAnalytics = async (req, res) => {
    try {
        const payments = await Payment.find({ paymentStatus: 'paid' });

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalTransactions = payments.length;

        // Revenue by payment method
        const methodBreakdown = {};
        payments.forEach(p => {
            const method = p.paymentMethod || 'unknown';
            methodBreakdown[method] = (methodBreakdown[method] || 0) + p.amount;
        });

        // Monthly revenue
        const monthlyRevenue = {};
        payments.forEach(p => {
            const month = new Date(p.paidAt || p.createdAt).toISOString().slice(0, 7);
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
        });

        res.json({
            totalRevenue,
            totalTransactions,
            methodBreakdown,
            monthlyRevenue,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
