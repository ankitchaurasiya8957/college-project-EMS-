const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        if (req.query.search) filters.title = { $regex: req.query.search, $options: 'i' };

        const events = await Event.find(filters).populate('createdBy', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;

        // Validate required fields
        if (!title || !description || !date || !location || !category || !totalSeats) {
            return res.status(400).json({ message: 'Please provide all required fields: title, description, date, location, category, totalSeats' });
        }

        const parsedSeats = parseInt(totalSeats);
        const parsedPrice = parseFloat(ticketPrice) || 0;

        if (isNaN(parsedSeats) || parsedSeats <= 0) {
            return res.status(400).json({ message: 'Total seats must be a positive number' });
        }

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
    } catch (error) {
        console.error('❌ Error creating event:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
