const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_EXPIRY_MINUTES = 10;

/**
 * POST /api/bookings/send-otp
 * Send OTP for booking verification (legacy flow for non-payment bookings)
 */
exports.sendBookingOTP = asyncHandler(async (req, res, next) => {
    const otp = generateOTP();
    await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await OTP.create({ email: req.user.email, otp, action: 'event_booking', expiresAt });
    await sendOTPEmail(req.user.email, otp, 'event_booking');
    res.json({ success: true, message: 'OTP sent successfully' });
});

/**
 * POST /api/bookings
 * Create a booking (legacy OTP-based flow)
 */
exports.bookEvent = asyncHandler(async (req, res, next) => {
    const { eventId, otp } = req.body;

    // Verify OTP explicitly before proceeding
    const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
    if (!validOTP || new Date() > validOTP.expiresAt) {
        if (validOTP) await OTP.deleteOne({ _id: validOTP._id });
        return next(new ErrorResponse('Invalid or expired OTP for booking', 400));
    }

    const event = await Event.findById(eventId);
    if (!event) return next(new ErrorResponse('Event not found', 404));
    if (event.availableSeats <= 0) return next(new ErrorResponse('No seats available', 400));

    const existingBooking = await Booking.findOne({
        userId: req.user.id,
        eventId,
        status: { $in: ['pending', 'confirmed'] }
    });
    if (existingBooking) {
        return next(new ErrorResponse('Already booked or pending', 400));
    }

    const booking = await Booking.create({
        userId: req.user.id,
        eventId,
        status: 'pending',
        paymentStatus: 'not_paid',
        amount: event.ticketPrice
    });

    await OTP.deleteOne({ _id: validOTP._id }); // cleanup

    res.status(201).json({ success: true, message: 'Booking request submitted', booking });
});

/**
 * PUT /api/bookings/:id/confirm
 * Admin: Confirm a pending booking
 */
exports.confirmBooking = asyncHandler(async (req, res, next) => {
    const { paymentStatus } = req.body; // 'paid' or 'not_paid'
    const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
    if (!booking) return next(new ErrorResponse('Booking not found', 404));

    if (booking.status === 'confirmed') {
        return next(new ErrorResponse('Booking is already confirmed', 400));
    }

    // BUG-1 FIX: Atomic seat decrement prevents race conditions
    const updatedEvent = await Event.findOneAndUpdate(
        { _id: booking.eventId._id, availableSeats: { $gt: 0 } },
        { $inc: { availableSeats: -1 } },
        { new: true }
    );
    if (!updatedEvent) {
        return next(new ErrorResponse('No seats available to confirm this booking', 400));
    }

    booking.status = 'confirmed';
    if (paymentStatus) {
        booking.paymentStatus = paymentStatus;
    }
    await booking.save();

    // Send email on admin confirmation
    await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

    res.json({ success: true, message: 'Booking confirmed successfully', booking });
});

/**
 * GET /api/bookings/my
 * Get current user's bookings
 */
exports.getMyBookings = asyncHandler(async (req, res, next) => {
    const bookings = req.user.role === 'admin'
        ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
        : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
    res.json(bookings);
});

/**
 * GET /api/bookings/all
 * Admin: Get all bookings
 */
exports.getAllBookings = asyncHandler(async (req, res, next) => {
    const bookings = await Booking.find()
        .populate('eventId')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    res.json(bookings);
});

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
exports.cancelBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new ErrorResponse('Booking not found', 404));
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized', 403));
    }
    if (booking.status === 'cancelled') {
        return next(new ErrorResponse('Already cancelled', 400));
    }

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

    res.json({ success: true, message: 'Booking cancelled successfully' });
});

/**
 * GET /api/bookings/event/:eventId/participants
 * Get all participants for a specific event (Admin)
 */
exports.getEventParticipants = asyncHandler(async (req, res, next) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return next(new ErrorResponse('Event not found', 404));

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
});

/**
 * GET /api/bookings/analytics
 * Admin: Booking analytics
 */
exports.getBookingAnalytics = asyncHandler(async (req, res, next) => {
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
});
