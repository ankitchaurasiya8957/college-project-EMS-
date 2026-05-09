const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_EXPIRY_MINUTES = 10;

/**
 * POST /api/bookings/send-otp
 * Send OTP for booking verification (legacy flow for non-payment bookings)
 */
exports.sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await OTP.create({ email: req.user.email, otp, action: 'event_booking', expiresAt });
        await sendOTPEmail(req.user.email, otp, 'event_booking');
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

/**
 * POST /api/bookings
 * Create a booking (legacy OTP-based flow)
 */
exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!validOTP || new Date() > validOTP.expiresAt) {
            if (validOTP) await OTP.deleteOne({ _id: validOTP._id });
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        const existingBooking = await Booking.findOne({
            userId: req.user.id,
            eventId,
            status: { $in: ['pending', 'confirmed'] }
        });
        if (existingBooking) {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteOne({ _id: validOTP._id }); // cleanup

        res.status(201).json({ message: 'Booking request submitted', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * PUT /api/bookings/:id/confirm
 * Admin: Confirm a pending booking
 */
exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body; // 'paid' or 'not_paid'
        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });

        const event = await Event.findById(booking.eventId._id);
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();

        event.availableSeats -= 1;
        await event.save();

        // Send email on admin confirmation
        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * GET /api/bookings/my
 * Get current user's bookings
 */
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * GET /api/bookings/all
 * Admin: Get all bookings
 */
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('eventId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * GET /api/bookings/event/:eventId/participants
 * Get all participants for a specific event (Admin)
 */
exports.getEventParticipants = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const bookings = await Booking.find({ eventId, status: { $in: ['confirmed', 'pending'] } })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        // Fetch associated payments for these bookings
        const payments = await Payment.find({
            eventId,
            paymentStatus: 'paid'
        }).select('userId transactionId paymentMethod amount paidAt');

        // Build a map of userId -> payment info
        const paymentMap = {};
        payments.forEach(p => {
            paymentMap[p.userId.toString()] = {
                transactionId: p.transactionId,
                paymentMethod: p.paymentMethod,
                paidAmount: p.amount,
                paidAt: p.paidAt,
            };
        });

        const participants = bookings.map(b => ({
            _id: b._id,
            bookingId: b.bookingId,
            bookingType: b.bookingType || 'booking',
            user: b.userId,
            status: b.status,
            paymentStatus: b.paymentStatus,
            paymentMethod: b.paymentMethod || paymentMap[b.userId?._id?.toString()]?.paymentMethod || null,
            transactionId: b.transactionId || paymentMap[b.userId?._id?.toString()]?.transactionId || null,
            amount: b.amount,
            bookedAt: b.bookedAt,
        }));

        res.json({
            event: {
                _id: event._id,
                title: event.title,
                date: event.date,
                location: event.location,
                category: event.category,
                totalSeats: event.totalSeats,
                availableSeats: event.availableSeats,
                ticketPrice: event.ticketPrice,
            },
            totalParticipants: bookings.filter(b => b.status === 'confirmed').length,
            pendingCount: bookings.filter(b => b.status === 'pending').length,
            participants,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * GET /api/bookings/analytics
 * Admin: Booking analytics
 */
exports.getBookingAnalytics = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        const paidBookings = await Booking.countDocuments({ paymentStatus: 'paid', status: 'confirmed' });

        // Revenue calculation
        const paidBookingsList = await Booking.find({ paymentStatus: 'paid', status: 'confirmed' });
        const totalRevenue = paidBookingsList.reduce((sum, b) => sum + (b.amount || 0), 0);

        // Bookings per event
        const eventBookings = await Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'pending'] } } },
            { $group: { _id: '$eventId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // Populate event names
        const Event = require('../models/Event');
        const populatedEventBookings = await Promise.all(
            eventBookings.map(async (eb) => {
                const event = await Event.findById(eb._id).select('title');
                return { event: event?.title || 'Unknown', count: eb.count };
            })
        );

        res.json({
            totalBookings,
            confirmedBookings,
            pendingBookings,
            cancelledBookings,
            paidBookings,
            totalRevenue,
            topEvents: populatedEventBookings,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
