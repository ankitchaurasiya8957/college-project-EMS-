/**
 * asyncHandler — Wraps async route handlers to catch errors automatically.
 *
 * Instead of writing try/catch in every controller:
 *
 *   exports.getEvents = async (req, res) => {
 *       try { ... } catch (err) { res.status(500).json(...) }
 *   };
 *
 * You can write:
 *
 *   exports.getEvents = asyncHandler(async (req, res, next) => {
 *       // just throw or call next(new ErrorResponse(...))
 *       // errors auto-caught and forwarded to errorMiddleware
 *   });
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
