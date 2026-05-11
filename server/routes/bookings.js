const express = require('express');
const router = express.Router();
const {
    bookEvent,
    confirmBooking,
    getMyBookings,
    getAllBookings,
    cancelBooking,
    sendBookingOTP,
    getEventParticipants,
    getBookingAnalytics
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validators');

// ── User Routes ──
router.post('/send-otp', protect, sendBookingOTP);
router.post('/', protect, validate.bookEvent, bookEvent);
router.get('/my', protect, getMyBookings);
router.delete('/:id', protect, validate.cancelBooking, cancelBooking);

// ── Admin Routes ──
router.get('/all', protect, admin, getAllBookings);
router.put('/:id/confirm', protect, admin, validate.confirmBooking, confirmBooking);
router.get('/event/:eventId/participants', protect, admin, validate.getEventParticipants, getEventParticipants);
router.get('/analytics', protect, admin, getBookingAnalytics);

module.exports = router;
