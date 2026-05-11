/**
 * ErrorResponse — Custom error class for consistent API error responses.
 *
 * Usage in controllers:
 *   return next(new ErrorResponse('Event not found', 404));
 *
 * This avoids repeated try/catch blocks and manual res.status() calls.
 * The global error middleware catches these and formats a JSON response.
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Capture correct stack trace (excludes constructor call from the trace)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorResponse;
