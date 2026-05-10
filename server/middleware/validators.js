/**
 * Request Validators — Schema-based validation using express-validator.
 *
 * Each validator is an array of validation chains that runs BEFORE
 * the controller logic. If validation fails, a 400 error is returned
 * with a detailed list of field-level issues.
 *
 * Usage in routes:
 *   router.post('/register', validate.register, register);
 */
const { body, param, validationResult } = require('express-validator');

/**
 * Middleware: Checks validation results and returns errors if any.
 * Must be placed at the end of each validator array.
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(e => e.msg);
        return res.status(400).json({
            success: false,
            message: messages[0], // Show first error as main message
            errors: messages,     // Full list for debugging
        });
    }
    next();
};

// ════════════════════════════════════════
//  AUTH VALIDATORS
// ════════════════════════════════════════

const register = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidation,
];

const login = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidation,
];

const verifyOTP = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
        .isNumeric().withMessage('OTP must contain only numbers'),
    handleValidation,
];

const forgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    handleValidation,
];

const resetPassword = [
    body('resetToken')
        .notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidation,
];

const updateProfile = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    handleValidation,
];

// ════════════════════════════════════════
//  EVENT VALIDATORS
// ════════════════════════════════════════

const createEvent = [
    body('title')
        .trim()
        .notEmpty().withMessage('Event title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Event description is required')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('date')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Please provide a valid date (ISO 8601 format)'),
    body('location')
        .trim()
        .notEmpty().withMessage('Event location is required'),
    body('category')
        .trim()
        .notEmpty().withMessage('Event category is required'),
    body('totalSeats')
        .notEmpty().withMessage('Total seats is required')
        .isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
    body('ticketPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Ticket price must be a non-negative number'),
    handleValidation,
];

const updateEvent = [
    param('id')
        .isMongoId().withMessage('Invalid event ID format'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('totalSeats')
        .optional()
        .isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
    body('ticketPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Ticket price must be a non-negative number'),
    handleValidation,
];

// ════════════════════════════════════════
//  BOOKING VALIDATORS
// ════════════════════════════════════════

const bookEvent = [
    body('eventId')
        .notEmpty().withMessage('Event ID is required')
        .isMongoId().withMessage('Invalid event ID format'),
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
    handleValidation,
];

const confirmBooking = [
    param('id')
        .isMongoId().withMessage('Invalid booking ID format'),
    body('paymentStatus')
        .optional()
        .isIn(['paid', 'not_paid']).withMessage('Payment status must be "paid" or "not_paid"'),
    handleValidation,
];

const cancelBooking = [
    param('id')
        .isMongoId().withMessage('Invalid booking ID format'),
    handleValidation,
];

const getEventParticipants = [
    param('eventId')
        .isMongoId().withMessage('Invalid event ID format'),
    handleValidation,
];

// ════════════════════════════════════════
//  PAYMENT VALIDATORS
// ════════════════════════════════════════

const createOrder = [
    body('eventId')
        .notEmpty().withMessage('Event ID is required')
        .isMongoId().withMessage('Invalid event ID format'),
    body('bookingType')
        .optional()
        .isIn(['booking', 'participation']).withMessage('Booking type must be "booking" or "participation"'),
    handleValidation,
];

const verifyPayment = [
    body('razorpay_order_id')
        .notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id')
        .notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature')
        .notEmpty().withMessage('Razorpay signature is required'),
    handleValidation,
];

const generateUpiQr = [
    body('orderId')
        .notEmpty().withMessage('Order ID is required'),
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isNumeric().withMessage('Amount must be a number'),
    handleValidation,
];

module.exports = {
    // Auth
    register,
    login,
    verifyOTP,
    forgotPassword,
    resetPassword,
    updateProfile,
    // Events
    createEvent,
    updateEvent,
    // Bookings
    bookEvent,
    confirmBooking,
    cancelBooking,
    getEventParticipants,
    // Payments
    createOrder,
    verifyPayment,
    generateUpiQr,
};
