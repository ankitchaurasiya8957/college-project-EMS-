const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validators');

// ── Public Routes ──
router.get('/', getEvents);
router.get('/:id', getEventById);

// ── Authenticated User Routes ──
router.post('/user-create', protect, validate.createEvent, createEvent);

// ── Admin Routes ──
router.post('/', protect, admin, validate.createEvent, createEvent);
router.put('/:id', protect, admin, validate.updateEvent, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
