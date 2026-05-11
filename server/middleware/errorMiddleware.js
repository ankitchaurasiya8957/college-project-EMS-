const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Global Error Handling Middleware
 *
 * Catches all errors passed via next(error) from any controller.
 * Handles specific Mongoose/MongoDB errors and transforms them
 * into clean, consistent JSON error responses.
 *
 * Must be registered AFTER all routes in server.js:
 *   app.use(errorHandler);
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error(`❌ [${req.method}] ${req.originalUrl} — ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // ── Mongoose bad ObjectId (CastError) ──
    if (err.name === 'CastError') {
        const message = `Resource not found (invalid ID: ${err.value})`;
        error = new ErrorResponse(message, 404);
    }

    // ── Mongoose duplicate key error ──
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        const message = `Duplicate value entered for: ${field}`;
        error = new ErrorResponse(message, 400);
    }

    // ── Mongoose validation error ──
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        const message = `Validation failed: ${messages.join('. ')}`;
        error = new ErrorResponse(message, 400);
    }

    // ── JWT errors ──
    if (err.name === 'JsonWebTokenError') {
        error = new ErrorResponse('Invalid token. Please log in again.', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new ErrorResponse('Token expired. Please log in again.', 401);
    }

    // ── Send response ──
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
