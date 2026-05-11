const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * GET /api/events
 * Get all events with optional search and category filter
 */
exports.getEvents = asyncHandler(async (req, res, next) => {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.search) filters.title = { $regex: req.query.search, $options: 'i' };

    const events = await Event.find(filters).populate('createdBy', 'name email');
    res.json(events);
});

/**
 * GET /api/events/:id
 * Get a single event by ID
 */
exports.getEventById = asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
        return next(new ErrorResponse('Event not found', 404));
    }
    res.json(event);
});

/**
 * POST /api/events
 * Admin: Create a new event
 */
exports.createEvent = asyncHandler(async (req, res, next) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;

    const parsedSeats = parseInt(totalSeats);
    const parsedPrice = parseFloat(ticketPrice) || 0;

    const event = await Event.create({
        title,
        description,
        date: new Date(date),
        location,
        category,
        totalSeats: parsedSeats,
        availableSeats: parsedSeats,
        ticketPrice: parsedPrice,
        image: image || '',
        createdBy: req.user.id
    });

    console.log('✅ Event created:', event.title);
    res.status(201).json(event);
});

/**
 * PUT /api/events/:id
 * Admin: Update an existing event
 */
exports.updateEvent = asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        return next(new ErrorResponse('Event not found', 404));
    }

    // BUG-7 FIX: Only allow whitelisted fields to prevent overwriting _id, createdBy, etc.
    const allowedFields = ['title', 'description', 'date', 'location', 'category', 'totalSeats', 'ticketPrice', 'image'];
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            event[field] = req.body[field];
        }
    });

    // If totalSeats is being updated, automatically recalculate availableSeats accurately
    if (req.body.totalSeats !== undefined) {
        const newTotalSeats = parseInt(req.body.totalSeats);
        if (!isNaN(newTotalSeats)) {
            const bookedCount = await Booking.countDocuments({
                eventId: event._id,
                status: 'confirmed'
            });

            event.availableSeats = newTotalSeats - bookedCount;

            // Prevent availableSeats from becoming negative
            if (event.availableSeats < 0) {
                event.availableSeats = 0;
            }
        }
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
});

/**
 * DELETE /api/events/:id
 * Admin: Delete an event
 */
exports.deleteEvent = asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        return next(new ErrorResponse('Event not found', 404));
    }

    // BUG-6 FIX: Cancel associated bookings and clean up payments before deleting
    await Booking.updateMany(
        { eventId: event._id, status: { $in: ['pending', 'confirmed'] } },
        { status: 'cancelled' }
    );
    await Payment.updateMany(
        { eventId: event._id, paymentStatus: 'created' },
        { paymentStatus: 'failed' }
    );

    await Event.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Event deleted: "${event.title}" — associated bookings cancelled`);
    res.json({ success: true, message: 'Event deleted successfully' });
});
