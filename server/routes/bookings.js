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

// ── User Routes ──
router.post('/send-otp', protect, sendBookingOTP);
router.post('/', protect, bookEvent);
router.get('/my', protect, getMyBookings);
router.delete('/:id', protect, cancelBooking);

// ── Admin Routes ──
router.get('/all', protect, admin, getAllBookings);
router.put('/:id/confirm', protect, admin, confirmBooking);
router.get('/event/:eventId/participants', protect, admin, getEventParticipants);
router.get('/analytics', protect, admin, getBookingAnalytics);

module.exports = router;
